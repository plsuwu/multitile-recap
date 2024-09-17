import RedisCacheWorker from '@server/cache';
import type { CacheData } from '@/lib/types';
import { redirect, type PageServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const access = locals.user?.access;
	const sessionId = locals.session?.id;
	const twitchId = locals.user?.twitch_id;
	const userId = locals.user?.id;

	if (!access || !sessionId || !twitchId || !userId) {
		redirect(307, '/');
	}

    const { display_name } = locals.user;
    const worker = new RedisCacheWorker({});
    const cached: CacheData | null = await worker.readData(userId);

    worker.close();


	if (!cached) {
		// this is probably either manual navigation to this page
		// or the result of an error (DB??)
		return;
	}
    const { following, subscriptions, recaps } = cached.data;

	return {
		display_name,
		subs: JSON.parse(subscriptions),
		follows: JSON.parse(following),
		recaps: JSON.parse(recaps),
	};
};
