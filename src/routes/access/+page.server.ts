import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import RedisCacheWorker from '@server/cache';
import type { CacheData, TwitchUser } from '@/lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const sessionId = locals.session?.id;
	const userId = locals.user?.id;
	const twitchId = locals.user?.twitch_id;
	const access = locals.user?.access;
	const displayName = locals.user?.display_name;
    const color = locals.user?.color;

	if (!access || !sessionId || !twitchId || !userId || !displayName) {
		redirect(307, '/?err=missing%20credentials');
	}

	return {
		displayName,
		user: userId,
        color,
	};
};
