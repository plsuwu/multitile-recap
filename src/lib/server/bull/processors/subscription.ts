import { authorizedHeadersFrom } from '$server/helix/utils';
import type { BaseJobData } from '$types/queue/types';
import { DataProcessor } from './base';
import { db } from '$server/postgres/db';
import { connection as redis } from '$server/redis/redis';
import { hx } from '$server/helix/api';
import type { SubscriptionInsert } from '$types';
import { pg } from '$server/postgres/postgres';

export class SubscriptionProcessor extends DataProcessor {
    readonly name = 'subscription';

    async process({ userId, access }: BaseJobData): Promise<void> {
        const headers = authorizedHeadersFrom(access);
        await this.updateProgress({
            userId,
            complete: 0,
            total: 0,
            status: 'pending',
            message: `${userId}: waiting a moment...`,
        })
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            let complete = 0;
            let total = 0;

            const followed = await pg.select.follows(userId);
            if (followed.length === 0) {
                await this.updateProgress({
                    userId,
                    complete,
                    total,
                    status: 'failed',
                    message: `${userId}: no followed users in db`,
                });

                return;
            }

            total = followed.length;

            const broadcasters = followed.map((br) => br.broadcaster_id);
            const subscriptions = await Promise.all(
                broadcasters.map(async (broadcasterId) => {
                    await this.updateProgress({
                        userId,
                        complete,
                        total,
                        status: 'pending',
                        message: `${userId}: check subscription status: ${broadcasterId}`,
                    });

                    const subscriptionBody = await hx.subscription(
                        {
                            user: userId,
                            broadcaster: broadcasterId,
                        },
                        headers,
                    );

                    if (subscriptionBody !== null) {
                        const subscription: SubscriptionInsert = {
                            user_id: userId,
                            broadcaster_id: broadcasterId,
                            tier: Number(subscriptionBody.data[0].tier[0]),
                            is_gift: subscriptionBody.data[0].is_gift,
                            gifter_id: subscriptionBody.data[0].gifter_id,
                            gifter_name: subscriptionBody.data[0].gifter_name,
                            last_sync: new Date(),
                        };

                        await pg.insert.subscriptions(subscription);

                        ++complete;
                        await this.updateProgress({
                            userId,
                            complete,
                            total,
                            status: 'completed',
                            message: `${userId}: subscribes to ${broadcasterId}`,
                        });

                        /**
                         * queue badge fetch here??
                         */
                    } else {
                        await this.updateProgress({
                            userId,
                            complete,
                            total,
                            status: 'completed',
                            message: `${userId}: no subscription to ${broadcasterId}`,
                        });
                    }
                }),
            );
        } catch (err) {
            console.error(
                `[!] Err while processing subscriptions:`,
                err,
            );
            throw err;
        }
    }
}
