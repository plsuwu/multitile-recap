import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import { redirect } from '@sveltejs/kit';
import type { CacheData } from '@/lib/types';

export const GET = async (event: RequestEvent): Promise<Response> => {
	const access = event.locals.user?.access;
	const sessionId = event.locals.session?.id;
	const twitchId = event.locals.user?.twitch_id;
	const userId = event.locals.user?.id;

	if (!access || !sessionId || !twitchId || !userId) {
		return new Response(null, {
			status: 307,
			headers: {
				Location: '/',
			},
		});
	}

	const worker = new RedisCacheWorker({});
	const tmpGlobalToken = await worker.readTempAuth(userId);
	const cached = await worker.readData<CacheData>(userId);
	worker.close();

	const expired = event.locals.user?.refresh_after;
	if (expired && Date.parse(expired) < Date.now()) {
		// needs token refresh; currently not implemented and straight up
		// breaks all functionality when a user token expires
		redirect(307, '/api/login');
	}

	const wants = event.url.searchParams.get('wants');
	if (wants && !tmpGlobalToken && !cached?.data.recaps) {
		return new Response(null, {
			status: 307,
			headers: {
				Location: '/access',
			},
		});
	}

	if (wants) {
		await fetchRecaps(
			twitchId,
			userId,
			access,
			tmpGlobalToken as string,
			true
		);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/generate',
			},
		});
	} else {
		await fetchRecaps(
			twitchId,
			userId,
			access,
			tmpGlobalToken as string,
			false
		);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/follows',
			},
		});
	}
};
