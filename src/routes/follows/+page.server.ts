import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';
import RedisCacheWorker from '@server/cache';
import type {
	CacheData,
	SubscriptionsResponse,
	UserSubscriptions,
} from '@/lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const access = locals.user?.access;
	const twitchId = locals.user?.twitch_id;
	const userId = locals.user?.id;
	const sessionId = locals.session?.id;

	if (!access || !sessionId || !twitchId || !userId) {
		redirect(307, '/');
	}

    const expires = locals.user?.refresh_after;
    if (expires && Number(expires) < Date.now()) {
        redirect(307, '/api/generate');
    }

	const worker = new RedisCacheWorker({});
	const cached = await worker.readData<CacheData>(userId);
	worker.close();

	if (!cached || !cached.data || !cached.data.following) {
		console.error('[!] Missing or invalid data in cache.');

		// hgandle but forreal another time
		redirect(300, '/');
	}

	const { following, subscriptions } = cached.data;

	return {
		subscriptions,
		following,
	};
};
