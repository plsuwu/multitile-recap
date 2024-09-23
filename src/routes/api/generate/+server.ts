import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import { redirect } from '@sveltejs/kit';
import type { CacheData } from '@/lib/types';
import { twitch } from '@server/auth';

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
    const refresh = event.locals.user?.refresh;
	if (expired && Number(expired) < Date.now()) {
        if (!refresh) {

            // console.error('[!] Refresh token not defined! User must relog.');
            redirect(300, '/api/logout');
        }

		// needs token refresh; currently not implemented and straight up
		// breaks all functionality when a user token expires
        const refreshed = await twitch.refreshAccessToken(refresh);
        const refreshedUser = {
            id: userId,
            twitch_id: event.locals.user?.twitch_id,
            login: event.locals.user?.login,
            color: event.locals.user?.color,
            profile_image_url: event.locals.user?.profile_image_url,
            display_name: event.locals.user?.display_name,
            access: refreshed.accessToken,
            refresh: refreshed.refreshToken,
            refresh_after:
                Date.parse(refreshed.accessTokenExpiresAt.toString()),
        }

        const worker = new RedisCacheWorker({});
        await worker.delete(userId);
        await worker.writeUser(userId, refreshedUser);
        worker.close();
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
