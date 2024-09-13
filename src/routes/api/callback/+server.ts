import { twitch, lucia } from '@server/auth';
import { db, dbInit, dbInsert, dbSelect, dbUpdate } from '@server/db';
import { buildAuthorizedHeader } from '@server/utility';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';

const HELIX = {
	USER: 'https://api.twitch.tv/helix/users',
};

export const GET = async (event: RequestEvent): Promise<Response> => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('oauth_state') ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		// is this handled in `+error.svelte` ??
		return new Response(null, {
			status: 400,
		});
	}

	try {
		let tokens = await twitch.validateAuthorizationCode(code);
		const headers = buildAuthorizedHeader(tokens.accessToken);

		const userRequest = await fetch(HELIX.USER, {
			headers: headers,
		});
		const user = await userRequest.json();
		// console.log(tokens, user);
		// const accessTokenExpiresAt = tokens.accessTokenExpiresAt;

		// .. -> `SELECT <columns ?? '*'> FROM <name> <<WHERE {where.{column, value}}> ?? null>`
		// .. -> `INSERT INTO <name> (<...data.keys>) VALUES (<...data.values>)

		const existing = dbSelect({
			name: 'user',
			where: { column: 'twitch_id', value: user.id },
		});

		if (existing) {
			console.log('[+] Found existing user in Db');
			if (
				new Date(existing.refresh_after).getTime() <
				new Date().getTime()
			) {
				tokens = await twitch.refreshAccessToken(existing.refresh);

				// this could be condensed but i can't REALLY be bothered
				dbUpdate({
					name: 'user',
					data: {
						id: existing.id,
						twitch_id: existing.twitch_id,
						login: existing.login,
						display_name: existing.display_name,
						profile_image_url: existing.profile_image_url,
						access: tokens.accessToken,
						refresh: tokens.refreshToken,
						refresh_after:
							tokens.accessTokenExpiresAt.toISOString(),
					},
				});

				const reselected = dbSelect({
					name: 'user',
					where: { column: 'twitch_id', value: user.id },
				});

				const session = await lucia.createSession(reselected.id, {});
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes,
				});

				return new Response(null, {
					status: 302,
					headers: {
						Location: '/',
					},
				});
			}
		} else {
			const userId = generateIdFromEntropySize(10); // 16 chars
			// console.log(user);
			const {
				id,
				login,
				display_name,
				profile_image_url,
			} = user.data[0];

			const userData = {
				id: userId,
				twitch_id: id,
				login,
				display_name,
				profile_image_url,
				access: tokens.accessToken,
				refresh: tokens.refreshToken,
				refresh_after: tokens.accessTokenExpiresAt.toISOString(),
			};

			dbInsert({ name: 'user', data: userData });

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (err) {
		// ...
		if (err instanceof OAuth2RequestError) {
			console.error(
				'[!] OAuth2 Req error (serverside, during callback):',
				err
			);
			return new Response(null, {
				status: 400,
			});
		}

		if (
			(err as any).message &&
			((err as any).message as string).includes('no such table')
		) {
			dbInit(false);
			redirect(307, '/api/login');
		}

		console.error('[!] Unknown error (serverside, during callback):', err);
		return new Response(null, {
			status: 500,
		});
	}
};
