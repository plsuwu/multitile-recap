import {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_GQL_HARDCODED,
    TWITCH_OAUTH_TESTING,
    TWITCH_SHA256_HASH,
} from '$env/static/private';
import { dbInsert, dbSelect } from '@server/db';
import { buildAuthorizedHeader } from '@server/utility';

const TWITCH_GQL_ENDPOINT = 'https://gql.twitch.tv/gql';
const HELIX_FOLLOWED_ENDPOINT = 'https://api.twitch.tv/helix/channels/followed';
const HELIX_SUBSCRIPTIONS_ENDPOINT =
    'https://api.twitch.tv/helix/subscriptions/user';
// const RECAP_BASE_ENDPOINT = 'https://www.twitch.tv/recaps';

interface FollowsResponse {
    data: Array<{
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        followed_at: string;
    }>;
    pagination: {
        cursor: string; // base64-encoded object
    };
    total: number;
}

enum SubscriptionTier {
    'TIER1' = 1000,
    'TIER2' = 2000,
    'TIER3' = 3000,
}

interface SubscriptionsResponse {
    data: Array<{
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        gifter_id?: string;
        gifter_login?: string;
        is_gift: boolean;
        tier: SubscriptionTier;
    }>;
}

export interface SubscriptionsResponseError {
    error: string;
    status: number;
    message: string;
}

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

async function fetchRecaps(twitchId: string, userId: string, token: string) {
    const existingTtv = dbSelect({
        name: 'ttv_cache',
        columns: ['follows_data', 'channel_data'],
        where: {
            value: userId,
            column: 'user_id'
        }
    });

    if (existingTtv) {
        const { follows_data, channel_data } = existingTtv;
        if (follows_data && channel_data) {

            // console.log('FOUND THE FOLLOWING DATA (USER FOLLOWS) IN DB: \n', follows_data);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/generate',
                },
            });
        }
    }

    // !! => NEED A PROPER OAUTH HEADER TO RUN THIS - IDEALLY A REAL OAUTH
    const gqlHeaders = buildAuthorizedHeader(TWITCH_OAUTH_TESTING, true, true, {
        'Cotent-Type': 'application/json',
    });
    // !!

    const helixHeaders = buildAuthorizedHeader(token);
    const follows = await fetchFollows(twitchId, helixHeaders);

    let subscriptions = await Promise.all(
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

    try {
        const recaps = await Promise.all(
            subscriptions.map(async (broadcaster) => {
                const [matches] = [...new Date().toISOString().matchAll(/(\d{4}-\d{2}-)/gm)];
                const currentRecapMonth = matches[0];

                // example query, idk if this is the same for everyone re. SHA hash
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
                                    // request or what
                                    TWITCH_SHA256_HASH,
                            },
                        },
                    },
                    {
                        operationName: 'RecapsQuery',
                        variables: { 'channelId': '598826002', 'endsAt': '2024-09-02T00:00:00.000Z' }, 'extensions': { 'persistedQuery': { 'version': 1, 'sha256Hash': '3d60235d1413d86448175cc84c6b6a68537495f6954730fe95438707c8d68e57' } } }
                ];

                const res = await fetch(`https://gql.twitch.tv/gql`, {
                    method: 'POST',
                    headers: gqlHeaders,
                    body: JSON.stringify(op),
                });

                const [body] = await res.json();
                // const { id, displayName, profileImageURL, self } =
                //     body.data.user;
                //
                // const result = { id, displayName, profileImageURL, self };
                return body;
            })
        );

        const followString = JSON.stringify(follows.data);
        const subscriptionString = JSON.stringify(subscriptions);
        const recapsString = JSON.stringify(recaps);

        dbInsert({
            name: 'ttv_cache',
            data: {
                user_id: userId,
                subs_data: subscriptionString,
                follows_data: followString,
                recaps_data: recapsString,
                created_at: Date.now().toString(),
            },
        });
    } catch (err) {
        console.error('[!] issue while fetching recap:', err);
    }
}

export { fetchRecaps, fetchFollows, fetchSubscriptions };
