import type { RequestEvent } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { TWITCH_CLIENT_ID } from '$env/static/private';
import RedisCacheWorker from '@server/cache';

const TWITCH_OAUTH_REVOKE = 'https://id.twitch.tv/oauth2/revoke';
export async function GET(event: RequestEvent): Promise<Response> {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	const userId = event.locals.user?.id;
	const access = event.locals.user?.access;

	if (!sessionId || !access || !userId) {
		console.error(
			'[!] Unable to correctly determine data to revoke:',
			'session ->',
			sessionId,
			'w/ lucia userId ->',
			userId
		);

		return new Response(null, {
			status: 404,
			headers: {
				Location: '/',
			},
		});
	}

	const worker = new RedisCacheWorker({});
	try {
		const revoke = await fetch(TWITCH_OAUTH_REVOKE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: TWITCH_CLIENT_ID,
				token: access,
			}),
		});

		if (!revoke.ok) {
			switch (revoke.status) {
				case 400:
					console.error(
						'[!] Token was already invalid, unable to revoke.'
					);
					break;

				case 404:
					console.error("[!] Client couldn't be found.");
					break;

				default:
					console.error(
						'[!] Twitch returned an undocumented response status.'
					);
					break;
			}
		} else {

			await worker.delete(userId);
		}

        worker.close();
		await lucia.invalidateSession(sessionId);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (err) {

        worker.close();
		console.error('[!] Unable to revoke token:', err);
		return new Response(null, {
			status: 500,
			headers: {
				Location: '/',
			},
		});
	}
}
