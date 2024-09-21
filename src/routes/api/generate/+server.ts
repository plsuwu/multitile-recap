import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import { redirect } from '@sveltejs/kit';
import type { CacheData } from '$lib/types';

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
    const hasData = await worker.readData<CacheData>(userId);
    worker.close();

    const wants = event.url.searchParams.get('wants');

    if (wants && (!tmpGlobalToken || !hasData?.data.recaps)) {
        await fetchRecaps(twitchId, userId, access, tmpGlobalToken as string, wants ? true : false);

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


    if (wants) {

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/generate',
            },
        });

    } else {

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/follows',
            },
        });
    }
};
