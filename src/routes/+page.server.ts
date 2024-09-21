import type { PageServerLoad, RequestEvent } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const { locals } = event;
	if (!locals.user) return null;

	const e = event.url.searchParams.get('e');
	const { display_name, profile_image_url, color } = locals.user;

	return {
		display_name,
		profile_image_url,
		color,
		e,
	};
};
