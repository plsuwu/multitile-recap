import { DataProcessor } from './base';
import type { BaseJobData } from '$types/queue/types';
import { authorizedHeadersFrom } from '$server/helix/utils';
import { fetchFollowed } from '$server/helix/followed';
import type { UserInsert } from '$types';
import { hx } from '$server/helix/api';
import { pg } from '$server/postgres/postgres';
import { SubscriptionProcessor } from './subscription';

export class FollowedProcessor extends DataProcessor {
	readonly name = 'followed';

	async process({ userId, access }: BaseJobData) {
		const headers = authorizedHeadersFrom(access);
		try {
			let complete = 0;
			let total = 0;

			await this.updateProgress({
				userId,
				complete,
				total,
				status: 'pending',
				message: `${userId}: followed job queued, waiting`,
			});

			const followed = await fetchFollowed(userId, headers);

            total = followed.length;
            await this.updateProgress({
                userId,
                complete,
                total,
                status: 'processing',
                message: `${userId}: initial followed fetch complete`,
            });

			const processed: UserInsert[] = await Promise.all(
				followed.map(async (ch) => {
					const broadcaster = await hx.fetchUserAndColor(
						headers,
						ch.broadcaster_id,
					);

			        await pg.insert.user(broadcaster);
                    await pg.insert.follows({
                        user_id: userId,
                        broadcaster_id: ch.broadcaster_id,
                        followed_at: new Date(ch.followed_at),
                        last_sync: new Date(),
                    });

					++complete;
					this.incrementProgress(
						userId,
						ch.broadcaster_id,
						total,
						complete,
					);

                    /**
                     * we can enqueue subscription job for the broadcaster
                     * we just finished processing here
                    */

					return {
                        ...broadcaster
					};
				}),
			);

            await this.updateProgress({
                userId,
                complete,
                total,
                status: 'completed',
                message: `${userId}: followed job complete`
            });
		} catch (err) {
            await this.updateProgress({
                userId,
                complete: 0,
                total: 0,
                status: 'failed',

                // assume we have caught something that implements `Error`
                message: (err as Error).message,
            });

            throw err;
		}
	}

	async incrementProgress(
		userId: string,
		broadcasterId: string,
		total: number,
		complete: number,
	) {
		this.updateProgress({
			userId,
			complete,
			total,
			status: 'processing',
			message: `${userId}: ins '${broadcasterId}' ok`,
		});
	}
}
