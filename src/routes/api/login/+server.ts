import { twitch } from '@server/auth';
import { db, dbInit } from '@server/db';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { generateState } from 'arctic';

export const GET = async (event: RequestEvent): Promise<Response> => {
	// debugging
	const isTest = event.url.searchParams.get('t');
	if (isTest) {
		db.prepare('DROP TABLE ttv_cache').run();
		db.prepare('DROP TABLE session').run();
		db.prepare('DROP TABLE user').run();

		dbInit(false);
	}

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
