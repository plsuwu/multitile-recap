import { TWITCH_CLIENT_ID } from '$env/static/private';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';
import { twitch, lucia, db } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';

enum UserType {
	admin = 'admin',
	global_mod = 'global_mod',
	staff = 'staff',
	null = ''
}

enum BroadcasterType {
	affiliate = 'affiliate',
	partner = 'partner',
	null = ''
}

interface HelixUserDataResponse {
	data: Array<{
		id: string;
		login: string;
		display_name: string;
		type: UserType;
		broadcaster_type: BroadcasterType;
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: string; // deprecated - invalid data
		email: string;
		created_at: string;
	}>;
}

interface DbUserData {
	id: string;
	login: string;
	display_name: string;
	profile_image_url: string;
    access: string;
    refresh: string;
}

const HELIX_USERINFO_URL = 'https://api.twitch.tv/helix/users';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const stored = event.cookies.get('csrf_oauth');

	// console.log(code, state, stored);

	if (!code || !state || !stored || state !== stored) {
		return new Response(null, {
			status: 401,
			headers: {
				Location: '/'
			}
		});
	}

	try {
		const tokens = await twitch.validateAuthorizationCode(code);
		const res = await fetch(HELIX_USERINFO_URL, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
				'Client-Id': TWITCH_CLIENT_ID
			}
		});

		const resp: HelixUserDataResponse = await res.json();
		const [user] = resp.data;

		const { id, login, display_name, profile_image_url } = user;

		const exists = db
			.query('SELECT * FROM user WHERE twitch_id = $twitch_id;')
			.get({ $twitch_id: id });

		if (exists) {
			const session = await lucia.createSession((exists as DbUserData).id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

            const updateTokens = db.query('UPDATE user SET access = $access, refresh = $refresh WHERE id = $id;');
            updateTokens.run({
                $access: tokens.accessToken,
                $refresh: tokens.refreshToken,
                $id: (exists as DbUserData).id
            });

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}

        // gens a random 16-char-long uid
		const userId = generateIdFromEntropySize(10);
		const insert_user = db.query(
			'INSERT INTO user VALUES ($id, $twitch_id, $login, $display_name, $profile_image_url, $access, $refresh);'
		);

		insert_user.all({
			$id: userId,
			$twitch_id: id,
			$login: login,
			$display_name: display_name,
			$profile_image_url: profile_image_url,
            $access: tokens.accessToken,
            $refresh: tokens.refreshToken
		});


		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (err: any) {
		if (err instanceof OAuth2RequestError) {
			return new Response(err.message, {
				status: 400
			});
		}

		let reason = err.messsage ? err.message : null;

		console.log(err);
		return new Response(reason, {
			status: 500
		});
	}
}
