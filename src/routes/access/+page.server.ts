import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../generate/$types';


export const load: PageServerLoad = async ({ locals }) => {
	const access = locals.user?.access;
	const sessionId = locals.session?.id;
	const twitchId = locals.user?.twitch_id;
	const userId = locals.user?.id;
    const displayName = locals.user?.display_name;

	if (!access || !sessionId || !twitchId || !userId || !displayName) {
		redirect(307, '/');
	}

	return {
		displayName,
        user: userId,
	};
};

