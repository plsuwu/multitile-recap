import RedisCacheWorker, { KeyType } from '$lib/server/cache';
import type { PageServerLoad, RequestEvent } from './$types';
import type { CacheData } from '$lib/types';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const { locals } = event;

    console.log('[*] INIT LOCALS?', locals);
	if (!locals.user) {
		return {
			user: null
		};
	}

	const { display_name, profile_image_url, color, login } = locals.user.ttv;
	const userId = locals.user.id;

	const worker = new RedisCacheWorker({});
	const cached = await worker.readData<CacheData>(userId, KeyType.User);
	worker.close();

	const refreshable =
		cached && cached.write_time && Number(cached.write_time) + 300000 <= Date.now();

	return {
		display_name,
		profile_image_url,
		color,
		login,
		refreshable
	};
};
