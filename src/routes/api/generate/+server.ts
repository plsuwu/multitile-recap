import type { RequestEvent } from './$types';
import { fetchRecaps } from './utils';
import { dbSelect } from '@server/db';
import { redirect } from '@sveltejs/kit';

export const GET = async (event: RequestEvent): Promise<Response> => {
	const access = event.locals.user?.access;
	const sessionId = event.locals.session?.id;
	const twitchId = event.locals.user?.twitch_id;
	const userId = event.locals.user?.id;

	if (!access || !sessionId || !twitchId || !userId) {
		return new Response(null, {
			status: 307,
			headers: {
				Location: '/',
			},
		});
	}

	// check if we need to refresh
	const expired = event.locals.user?.refresh_after;
	if (expired && Date.parse(expired) < Date.now()) {
		redirect(307, '/api/login');
	}

	const _recaps = await fetchRecaps(twitchId, userId, access);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/generate',
		},
	});
};
