import {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_GQL_HARDCODED,
    TWITCH_SHA256_HASH,
} from '$env/static/private';
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
import { redirect } from '@sveltejs/kit';

const TWITCH_GQL_ENDPOINT = 'https://gql.twitch.tv/gql';
const HELIX_FOLLOWED_ENDPOINT = 'https://api.twitch.tv/helix/channels/followed';
const HELIX_SUBSCRIPTIONS_ENDPOINT =
    'https://api.twitch.tv/helix/subscriptions/user';

async function fetchFollows(
    twitchId: string,
    headers: Headers,
    after: string | null = null
): Promise<FollowsResponse> {
    const buildUri = (): string => {
        let uri = `${HELIX_FOLLOWED_ENDPOINT}?user_id=${twitchId}`;
        if (after != null) {
            uri += `&after=${after}`;
        }
        uri += '&first=100';

        return uri;
    };

    const uri = buildUri();
    const following = await fetch(uri, {
        method: 'GET',
        headers: headers,
    });
    const body: FollowsResponse = await following.json();

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
}

async function fetchSubscriptions(
    twitchId: string,
    broadcasterId: string,
    headers: Headers
): Promise<SubscriptionsResponse | SubscriptionsResponseError> {
    const uri = `${HELIX_SUBSCRIPTIONS_ENDPOINT}?broadcaster_id=${broadcasterId}&user_id=${twitchId}`;
    const res = await fetch(uri, {
        headers: headers,
    });

    const body: SubscriptionsResponse = await res.json();
    return body;
}

async function fetchRecaps(twitchId: string, userId: string, token: string, global: string) {
    const worker = new RedisCacheWorker({});

    const existingTtv: CacheData | null = await worker.readData(userId);
    if (existingTtv) {
        const { following, recaps, subscriptions } = existingTtv.data;
        if (following && recaps && subscriptions) {
            worker.close();
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/generate',
                },
            });
        }
    }

    const gqlHeaders = buildAuthorizedHeader(global, true, true, TWITCH_CLIENT_GQL_HARDCODED, [
        { 'Content-Type': 'application/json' }, { 'accept': '*/*' }, { Host: 'gql.twitch.tv' }
    ]);

    const helixHeaders = buildAuthorizedHeader(token);
    const follows: FollowsResponse = await fetchFollows(twitchId, helixHeaders);
    // console.log(helixHeaders, gqlHeaders);

    let subscriptions: Array<UserSubscriptions | undefined> = await Promise.all(
        follows.data.map(async (broadcaster) => {
            const res = await fetchSubscriptions(
                twitchId,
                broadcaster.broadcaster_id,
                helixHeaders
            );

            if (!(res as SubscriptionsResponseError).status) {
                // flatten single-item broadcaster array
                const [sub] = (res as SubscriptionsResponse).data;
                return sub;

            }
        })
    );

    subscriptions = subscriptions.filter(Boolean);

    // twitch staff do not perceive the rest of this function
    try {
        const recaps: RecapsQueryResponse[] = await Promise.all(
            subscriptions.map(async (broadcaster) => {
                const [matches] = [
                    ...new Date().toISOString().matchAll(/(\d{4}-\d{2}-)/gm),
                ];
                const currentRecapMonth = matches[0];

                // examplary query, i THINK this is the same for everyone but
                // i cannot confirm
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

                                    // unsure if this is sensitive or just like a hash of the
                                    // request or what but we will put it in the .env for now
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

                const [body] = await res.json();
                // console.log(body);
                return body;
            })
        );

        // i think our redis implementation can accept these as full JSON (using `HSET <KEY> DATA`)
        // but im not certain this is the truth and we already JSON.parse() in a bunch of locations
        // so we can figure this out later
        const followString = JSON.stringify(follows.data);
        const subscriptionString = JSON.stringify(subscriptions);
        const recapsString = JSON.stringify(recaps);

        await worker.writeData<CacheData>(userId, {
            id: userId,
            data: {
                following: followString,
                subscriptions: subscriptionString,
                recaps: recapsString,
            },
        });

        worker.close();
    } catch (err) {

        if (err instanceof TypeError) {
            // this is most likely due to a bad token, delete the token
            worker.close();
            return new Response(null, {
                status: 300,
                headers: {
                    Location: '/?e=bad_global_token',
                },
            });
        }

        worker.close();
        console.error('[!] issue while fetching recap:', err);
    }
}

export { fetchRecaps, fetchFollows, fetchSubscriptions };
