import { lucia } from '$lib/server/auth';
import { TWITCH_CLIENT_ID } from '$env/static/private';
import type { RequestEvent } from '../$types';

const TWITCH_OAUTH_REVOKE = 'https://id.twitch.tv/oauth2/revoke';

export async function GET(event: RequestEvent): Promise<Response> {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	const access = event.locals.user?.access;

	if (!sessionId || !access) {
		console.log(
			'[!] Unable to correctly determine data to revoke:',
			'sessionId ->',
			sessionId,
			'access ->',
			access
		);

		return new Response(null, {
			status: 404,
			headers: {
				Location: '/'
			}
		});
	}

	try {
		const revoke = await fetch(TWITCH_OAUTH_REVOKE, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: TWITCH_CLIENT_ID,
				token: access
			})
		});

		if (!revoke.ok) {
			switch (revoke.status) {
				case 400:
					console.error('[!] Token was already invalid, unable to revoke.');
					break;

				case 404:
					console.error("[!] Client couldn't be found.");
					break;

				default:
					console.error('[!] Twitch returned an undocumented status.');
					break;
			}
		} else {
			console.log('[+] Token revoked successfully.');
		}

		await lucia.invalidateSession(sessionId);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});

		// handle (report) issues we cause
	} catch (err) {
		console.log('[!] Unable to revoke token:', err);
		return new Response(null, {
			status: 500,
			headers: {
				Location: '/'
			}
		});
	}
}
