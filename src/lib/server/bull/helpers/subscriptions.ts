import type {
    HelixUserData,
    HelixFollowedData,
    HelixColorData,
    HelixSubscriptionData,
} from '$types/helix/api-response-types';
import { log } from '$logging';
import { authorizedHeadersFrom, HELIX } from '$server/helix/utils';
import { pg } from '$server/postgres/postgres';
import { pullFollowedFromHelix } from '$server/helix/followed';
import type { SubscriptionInsert, UserInsert } from '$types';
import { subscriptions } from '$server/postgres/schema';

export class SubscriptionSyncHelper {
    private headers;

    constructor(token: string) {
        this.headers = authorizedHeadersFrom(token);
    }

    private async fetchData<T>(
        endpoint: string,
        errContext: string,
    ): Promise<T | null> {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // idk throw the RateLimitError or something
                    console.error(
                        `SyncHelper.fetchData() rate limited (res.status '429'):`,
                        response.statusText,
                    );
                }

                if (response.status === 404) {
                    // this should only happen if we query HELIX.SUBSCRIPTION and the
                    // user is not subscribed
                    return null;
                }

                throw new Error(
                    `Unable to handle response code ${response.status} -> ${errContext}`,
                );
            }

            return (await response.json()) as T;
        } catch (err) {
            console.error('SyncHelper.fetchData() error during fetch:', err);
            throw err;
        }
    }

    private async dbOperation<T>(
        op: string,
        callback: () => Promise<T>,
    ): Promise<T> {
        try {
            return await callback();
        } catch (err) {
            throw new Error(
                `Unhandled error during SyncHelper.dbOperation(${op}):`,
                err as Error,
            );
        }
    }

    async checkSubscription(userId: string, broadcasterId: string) {
            const subscriptionData = await this.fetchData<HelixSubscriptionData>(
                `${HELIX.SUBSCRIPTIONS}?user_id=${userId}&broadcaster_id=${broadcasterId}`,
                'HELIX_FOLLOWED_SINGLE',
            );

            if (subscriptionData === null) {
                return null;
            }

            const subscription = subscriptionData.data[0];

            const insert: SubscriptionInsert = {
                user_id: userId,
                broadcaster_id: broadcasterId,
                tier: Number(subscription.tier[0]),
                is_gift: subscription.is_gift,
                gifter_name: subscription.gifter_name,
                gifter_id: subscription.gifter_id,
                last_sync: new Date(),
            }

            await this.dbOperation(
                'UPSERT_SUBSCRIPTION',
                async () => (
                    await pg.insert.subscriptions(insert)
                ),
            );
    }

    async getSubscriptions(userId: string, callback?: (br: any | string, idx: number) => Promise<void>) {
        let stored;
        try {
            const existing = await this.dbOperation('QUERY_STORED_SUBSCRIPTIONS', async () =>
                await pg.select.subscriptions(userId)
            )
            if (existing) {
                return existing;
            }
            stored = await this.dbOperation('QUERY_STORED_FOLLOWS', async () =>
                await pg.select.follows(userId),
            );

            let processed = 0;
            const subscribed = await Promise.all(
                stored.map(async (ch) => {
                    const br = await this.checkSubscription(userId, ch.broadcaster.id);
                    if (callback) {
                        await callback(br ?? ch.broadcaster.login, processed);
                    }

                    processed += 1;
                    return br;
                }),
            );

            return subscribed;
        } catch (err) {
            throw err;
        }
    }
}


