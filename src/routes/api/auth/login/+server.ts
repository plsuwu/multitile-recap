import { twitch } from '$auth/provider';
import { SCOPES } from '$helix/utils';
import { log } from '$logging';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET = async (event: RequestEvent) => {
	// TODO: do these actually create errors that i can catch at this stage?
	const state = generateState();
	const url = twitch.createAuthorizationURL(state, SCOPES);

	console.log(url.toString());

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
			provider: url.toString(),
		},
		{ status: 200 },
	);
};
