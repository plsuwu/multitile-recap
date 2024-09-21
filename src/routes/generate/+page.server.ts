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

    const hasAuth = await worker.readTempAuth(userId);
    const hasData = await worker.readData<CacheData>(userId);

	if (!hasData || !hasData.data.recaps) {
        console.error('[!] No recap data in cache.');
		// this is probably either a user manually navigating to this page,
		// or the result of a caching issue
        await worker.deleteAuth(userId);
        worker.close();
        redirect(307, '/?e=invalid_token');
	}
	const { following, subscriptions, recaps } = hasData.data;

    if (following && subscriptions && recaps && hasAuth) {
        console.warn('[*] Recaps data ok - purging global auth.');
        await worker.deleteAuth(userId);
    }

    worker.close();
	return {
		display_name,
		subs: subscriptions,
		follows: following,
		recaps: recaps,
	};
};
