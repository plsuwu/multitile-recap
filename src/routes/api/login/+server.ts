import { twitch } from '@server/auth';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET = async (event: RequestEvent): Promise<Response> => {
	// debugging
	const state = generateState();
	const scopes = {
		scopes: [
			'user:read:follows',
			'user:read:subscriptions',
			'user:read:email',
		],
	};

	const url = await twitch.createAuthorizationURL(state, scopes);

	event.cookies.set('oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	redirect(302, url.toString());
};
