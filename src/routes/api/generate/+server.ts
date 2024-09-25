import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import type { CacheData } from '@/lib/types';

const REQUEST_TYPES = ['recaps', 'base'];

export const GET = async (event: RequestEvent): Promise<Response> => {
    const access = event.locals.user?.access;
    const sessionId = event.locals.session?.id;
    const twitchId = event.locals.user?.twitch_id;
    const userId = event.locals.user?.id;

    if (!access || !sessionId || !twitchId || !userId) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Invalid or missing credentials',
                location: '/?err=missing%20credentials',
            }),
            {
                status: 400,
            }
        );
    }

    const worker = new RedisCacheWorker({});
    const tmpGlobalToken = await worker.readTempAuth(userId);
    const cached = await worker.readData<CacheData>(userId);
    worker.close();

    const expired = event.locals.user?.refresh_after;
    if (expired && Number(expired) < Date.now()) {
        const ref = await fetch('/api/refresh/access', {
            method: 'GET',
        });

        const body = await ref.json();
        if (body.error) {
            return new Response(
                JSON.stringify({
                    error: true,
                    message: 'Unable to refresh access token (see \'details\' field).',
                    details: body,
                }),
                {
                    status: body.status
                }
            );
        }
    }

    const type = event.url.searchParams.get('type') ?? 'base';
    if (!REQUEST_TYPES.includes(type)) {
        return new Response(
            JSON.stringify({
                error: true,
                message:
                    `Unknown search parameter '${type}':` +
                    `expected one of '${REQUEST_TYPES.join(', ')}'`,
                location: '/?err=missing%20credentials',
            }),
            {
                status: 404,
            }
        );
    }


    if (type === 'recaps' && !tmpGlobalToken && !cached?.data.recaps) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Missing cached recap data with a GQL auth token'
            }),
            {
                status: 403,
            }
        );
    }

    if (((type === 'recaps' && cached?.data.recaps)
        || (type === 'base' && cached?.data.following))
        // && !refreshData
    ) {
        return new Response(
        JSON.stringify({
            error: false,
            message: null
        }),
        {
            status: 200,
        });
    }

    const res = await fetchRecaps(
        twitchId,
        userId,
        access,
        tmpGlobalToken as string,
        type
    );

    if (res.status !== 200) {
        const body = await res.json();
        return new Response(
            JSON.stringify(body),
            {
                status: body.status,
            },
        );
    }

    return new Response(
        JSON.stringify({
            error: false,
            message: null,
        }),
        {
            status: 200,
        }
    );
}
