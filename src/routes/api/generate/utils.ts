import { TWITCH_CLIENT_ID, TWITCH_SHA256_HASH } from '$env/static/private';
import type {
    RecapsQueryResponse,
    SubscriptionsResponse,
    SubscriptionsResponseError,
    FollowsResponse,
    UserSubscriptions,
    CacheData,
} from '$lib/types';
import RedisCacheWorker from '@server/cache';
import { buildAuthorizedHeader } from '@server/utility';

export const TWITCH_GQL_ENDPOINT = 'https://gql.twitch.tv/gql';
const HELIX = {
    FOLLOWED: 'https://api.twitch.tv/helix/channels/followed',
    SUBSCRIPTIONS: 'https://api.twitch.tv/helix/subscriptions/user',
}


async function fetchFollows(
    twitchId: string,
    headers: Headers,
    after: string | null = null
): Promise<FollowsResponse | any> {
    const buildUri = (): string => {
        let uri = `${HELIX.FOLLOWED}?user_id=${twitchId}`;
        if (after != null) {
            uri += `&after=${after}`;
        }
        uri += '&first=100';

        return uri;
    };

    try {
        const uri = buildUri();
        const following = await fetch(uri, {
            method: 'GET',
            headers: headers,
        });

        const body: FollowsResponse = await following.json();
        if (!following.ok) {
            console.error(following.status, body);
            return;
        }


        // recursively call and merge to build out the `data` field until it
        // is the same length as twitch describes in the `total` field
        if (body.pagination.cursor && body.data && body.total > body.data.length) {
            const next: any = await fetchFollows(
                twitchId,
                headers,
                body.pagination.cursor
            );

            const merged: FollowsResponse = {
                data: [...body.data, ...next.data],
                total: body.total,
                pagination: next.pagination,
            };

            return merged;
        }

        return body;
    } catch (err) {
        console.error(err);
        return;
    }
}

async function fetchSubscriptions(
    twitchId: string,
    broadcasterId: string,
    headers: Headers
): Promise<SubscriptionsResponse | SubscriptionsResponseError> {
    const uri = `${HELIX.SUBSCRIPTIONS}?broadcaster_id=${broadcasterId}&user_id=${twitchId}`;
    const res = await fetch(uri, { headers: headers });

    const body: SubscriptionsResponse = await res.json();
    return body;
}

async function fetchRecaps(
    twitchId: string,
    userId: string,
    token: string,
    global: string | null,
    type: string,
): Promise<Response> {

    const worker = new RedisCacheWorker({});
    const cachedData = await worker.readData<CacheData>(userId);
    if (cachedData) {
        const { following, recaps, subscriptions } = cachedData.data;
        if ((type === 'recaps' && recaps)
            || (type === 'base' && following && subscriptions)) {
            worker.close();
            return new Response(null, {
                status: 200,
            });
        }
    }

    const helixHeaders = buildAuthorizedHeader(token);
    const follows: FollowsResponse = await fetchFollows(twitchId, helixHeaders);
    let subscriptions: Array<UserSubscriptions> = await Promise.all(
        follows.data.map(async (broadcaster) => {
            const res = await fetchSubscriptions(
                twitchId,
                broadcaster.broadcaster_id,
                helixHeaders
            );

            if (!(res as SubscriptionsResponseError).status) {
                const [sub] = (res as SubscriptionsResponse).data;
                return sub;
            }
        })
    ).then((res) => {
        return res.filter(Boolean) as UserSubscriptions[];
    });

    if (type === 'base') {
        const worker = new RedisCacheWorker({});
        await worker.writeData<CacheData>(userId, {
            id: userId,
            write_time: Date.now(),
            data: {
                following: follows.data,
                subscriptions: subscriptions,
                recaps: null,
            },
        });

        worker.close();
        return new Response(null, {
            status: 200,
        });
    }

    // twitch staff do not perceive the rest of this function
    // if (type === 'recaps') {
    else {
        if (!global) {
            return new Response(
                JSON.stringify({
                    error: true,
                    message: "GQL token required to process this request type"
                }),
                {
                    status: 400,
                }
            );
        }

        const gqlHeaders = buildAuthorizedHeader(
            global,
            true,
            TWITCH_CLIENT_ID,
            [
                { 'Content-Type': 'application/json' },
                { accept: '*/*' },
                { Host: 'gql.twitch.tv' },
            ]
        );

        try {
            const recaps: RecapsQueryResponse[] = await Promise.all(
                subscriptions.map(async (broadcaster) => {
                    const [matches] = [
                        ...new Date()
                            .toISOString()
                            .matchAll(/(\d{4}-\d{2}-)/gm),
                    ];
                    const currentRecapMonth = matches[0];

                    // i dont have any data to cross-reference this with, but i'm pretty
                    // sure this query remains largely the same across the board.
                    const op = [
                        {
                            operationName: 'RecapsQuery',
                            variables: {
                                channelId: `${broadcaster?.broadcaster_id}`,
                                endsAt: `${currentRecapMonth}02T00:00:00.000Z`,
                            },
                            extensions: {
                                persistedQuery: {
                                    version: 1,
                                    sha256Hash:
                                        // pretty sure this is used by the GQL server to
                                        // cache operations
                                        TWITCH_SHA256_HASH,
                                },
                            },
                        },
                    ];

                    const res = await fetch(TWITCH_GQL_ENDPOINT, {
                        method: 'POST',
                        headers: gqlHeaders,
                        body: JSON.stringify(op),
                    });

                    const [body]: RecapsQueryResponse[] = await res.json();
                    if (!body.data.user.self.recap.minutesWatched) {
                        body.data.user.self.recap.minutesWatched = '0';
                    }

                    return body;
                })
            );

            await worker.writeData<CacheData>(userId, {
                id: userId,
                write_time: Date.now(),
                data: {
                    following: follows.data,
                    subscriptions: subscriptions,
                    recaps: recaps,
                },
            });

            worker.close();
            return new Response(null, {
                status: 200,
            });

        } catch (err) {
            worker.close();

            if (err instanceof TypeError) {
                return new Response(
                    JSON.stringify({
                        error: true,
                        message: `Likely invalid global token: ${err}`,
                        details: err,
                    }),
                    {
                        status: 403,
                    }
                );
            }

            return new Response(
                JSON.stringify({
                    error: true,
                    message: `Unhandled error: ${err}`,
                    details: err,
                }),
                {
                    status: 500,
                }
            );
        }
    }
}

export { fetchRecaps, fetchFollows, fetchSubscriptions };
