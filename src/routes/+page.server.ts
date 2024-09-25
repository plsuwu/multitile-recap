import RedisCacheWorker from '@server/cache';
import type { PageServerLoad, RequestEvent } from './$types';
import type { CacheData } from '$lib/types';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const { locals } = event;
	if (!locals.user) return null;
	const { display_name, profile_image_url, color, login } = locals.user;
	const userId = locals.user.id;

	const worker = new RedisCacheWorker({});
	const cached = await worker.readData<CacheData>(userId);
	worker.close();


	const refreshable = cached && cached.write_time && (cached.write_time + 300000 < Date.now());

	return {
		display_name,
		profile_image_url,
		color,
		login,
		cache: refreshable ? cached : null,
	};
};
