import { dbSelect } from '@server/db';
import { redirect, type PageServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = ({ locals }) => {
	const access = locals.user?.access;
	const sessionId = locals.session?.id;
	const twitchId = locals.user?.twitch_id;
	const userId = locals.user?.id;

	if (!access || !sessionId || !twitchId || !userId) {
        redirect(307, '/');
	}

	const ttvCache = dbSelect({
		name: 'ttv_cache',
		where: {
			column: 'user_id',
			value: userId,
		},
	});

	const { display_name } = locals.user;

	if (!ttvCache) {
		// this is probably either manual navigation to this page
        // or the result of an error (DB??)
		return;
	}

	return {
		display_name,
		subs: JSON.parse(ttvCache.subs_data),
		follows: JSON.parse(ttvCache.follows_data),
		recaps: JSON.parse(ttvCache.recaps_data),
	};
};
