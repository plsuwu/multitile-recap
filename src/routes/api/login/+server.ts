import { json, type RequestEvent } from '@sveltejs/kit';
import { generateState } from 'arctic';

import RedisCacheWorker from '$lib/server/cache';
import { twitch } from '$lib/server/auth';
import { accessIsExpired } from '$lib/utils';

export const GET = async (event: RequestEvent): Promise<Response> => {
	const luciaId = event.locals.user?.id;
	const refreshAfter = event.locals.user?.tokens.expiry;
	const refreshToken = event.locals.user?.tokens.refresh;

	if (luciaId && refreshToken && refreshAfter && accessIsExpired(refreshAfter)) {
		// TODO: maybe just return an error and do the refresh in the click handler?
		const refreshed = await event.fetch('/api/refresh/access', {
			method: 'GET'
		});

		const body = await refreshed.json();
		if (!refreshed.ok) {
			console.error('[!] Error during token refresh: ', body);
			return json(
				{
					error: true,
					message: body
				},
				{ status: refreshed.status }
			);
		}

		return json(
			{
				error: false,
				message: null
			},
			{ status: 200 }
		);
	}

	try {
		const state = generateState();
		const scopes = ['user:read:follows', 'user:read:subscriptions'];

		const remoteUrl = twitch.createAuthorizationURL(state, scopes);
		event.cookies.set('csrf', state, {
			path: '/',
			secure: import.meta.env.PROD,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		return json(
			{
				error: false,
				message: remoteUrl.toString()
			},
			{ status: 200 }
		);

	} catch (err) {
		console.error('[!] Unhandled error during remote OAuth URL generation: ', err);
		return json(
			{
				error: true,
				message: 'Unhandled exception - refer to console output'
			},
			{ status: 500 }
		);
	}
};
