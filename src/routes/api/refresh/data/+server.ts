import type { CacheData } from '$lib/types';
import { fetchRecaps } from '@api/generate/utils';
import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent): Promise<Response> => {
	const userId = event.locals.user?.id;
	const access = event.locals.user?.access;
	const refreshAfter = event.locals.user?.refresh_after;
	const twitchId = event.locals.user?.twitch_id;

	if (!access || !userId || !twitchId || !refreshAfter) {
		return new Response(
			JSON.stringify({
				error: true,
				message: 'Invalid or missing credentials',
			}),
			{
				status: 404,
			}
		);
	}

	if (refreshAfter && Number(refreshAfter) <= Date.now()) {
		return new Response(
			JSON.stringify({
				error: true,
				message: 'User token needs to be refreshed',
			}),
			{
				status: 400,
			}
		);
	}

	const worker = new RedisCacheWorker({});
	const cache = await worker.readData<CacheData>(userId);
	const refreshable = (cache?.write_time as number) + 300000;
	const canRefreshIn = refreshable - Date.now();

	if (!cache || refreshable > Date.now()) {
        worker.close();
		return new Response(
			JSON.stringify({
				error: true,
				message: `Cannot refresh cached data yet (${canRefreshIn / 1000} seconds remaining)`,
			}),
			{
                status: 401
            }
		);
	}

	await worker.deleteData(userId);
	await worker.close();

	const res = await fetchRecaps(twitchId, userId, access, null, 'base');
    if (!res.ok) {
        const body = await res.json();
        return new Response(
            JSON.stringify(body),
            {
                status: body.status,
            }
        );
    }

	return new Response(null, {
		status: 200,
	});
};
