import { twitch } from '$auth/provider';
import { SCOPES } from '$helix/utils';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET = async (event: RequestEvent) => {
	const state = generateState();
	const url = twitch.createAuthorizationURL(state, SCOPES);

	event.cookies.set('_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	return json(
		{
			error: false,
			message: null,
			data: url.toString(),
		},
		{ status: 200 },
	);
};
