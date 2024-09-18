import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import { redirect } from '@sveltejs/kit';

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
    const hasData = await worker.readData(userId);
    worker.close();

    if (!tmpGlobalToken && !hasData) {
        return new Response(null, {
            status: 307,
            headers: {
                Location: '/access',
            }
        });
    }


	// check if we need to refresh
	const expired = event.locals.user?.refresh_after;
	if (expired && Date.parse(expired) < Date.now()) {
		redirect(307, '/api/login');
	}

	await fetchRecaps(twitchId, userId, access, tmpGlobalToken as string);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/generate',
		},
	});
};
