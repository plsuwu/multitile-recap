import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return null;

	const { display_name, profile_image_url, refresh_after } = locals.user;
	if (new Date(refresh_after).getTime() < new Date().getTime()) {
		redirect(302, '/api/login');
	}

	return {
		display_name,
		profile_image_url,
	};
};
