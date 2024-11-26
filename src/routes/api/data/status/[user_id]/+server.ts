import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import redis from '$server/redis';

export const GET = async (event: RequestEvent) => {
	const { user } = event.locals;
	if (!user) {
		return json(
			{
				error: true,
				message: 'must be logged in to check fetch job process',
			},
			{ status: 401 },
		);
	}

	const progress = {
		followed: await redis.redis.get(`followed_job_progress:${user.id}`),
		subscriptions: await redis.redis.get(
			`subscriptions_job_progress:${user.id}`,
		),
		badges: await redis.redis.get(`badges_job_progress:${user.id}`),
        all: await redis.redis.get(`batch_progress:${user.id}`),
	};

	progress.badges = progress.badges ? JSON.parse(progress.badges) : null;
	progress.subscriptions = progress.subscriptions ? JSON.parse(progress.subscriptions) : null;
	progress.followed = progress.followed ? JSON.parse(progress.followed) : null;
    progress.all = progress.all ? JSON.parse(progress.all) : null;

	return json(progress);
};
