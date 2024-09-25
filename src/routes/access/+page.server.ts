import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const sessionId = locals.session?.id;
	const userId = locals.user?.id;
	const twitchId = locals.user?.twitch_id;
	const access = locals.user?.access;
	const displayName = locals.user?.display_name;

	if (!access || !sessionId || !twitchId || !userId || !displayName) {
		redirect(300, '/?err=missing%20credentials');
	}

	return {
		displayName,
		user: userId,
	};
};
