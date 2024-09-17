import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return null;

	const { display_name, profile_image_url } = locals.user;

	return {
		display_name,
		profile_image_url,
	};
};
