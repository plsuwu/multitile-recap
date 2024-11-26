import type { RequestEvent } from '@sveltejs/kit';
import type { TwitchTokens, UserInsert } from '$types';
import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';
import { log } from '$logging';
import { twitch } from '$server/auth/provider';
import { authorizedHeadersFrom } from '$server/helix/utils';
import { hx } from '$server/helix/api';
import type {
	HelixColorData,
	HelixUserData,
} from '$types/helix/api-response-types';
import { makeNewUser } from '$server/auth/user';
import { createSession, generateSessionToken } from '$server/auth/session';
import { setSessionCookie } from '$server/auth/cookie';
import { generateState } from 'arctic';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const code = await validateCallbackEvent(event);
	const tokenResponse = await twitch.validateAuthorizationCode(code);

	const tokens: TwitchTokens = {
		access: tokenResponse.accessToken(),
		refresh: tokenResponse.refreshToken(),
		expiry: tokenResponse.accessTokenExpiresAt().getTime(),
	};
	const headers = authorizedHeadersFrom(tokens.access);
	let userBody, color;

	try {
		const userResponse: HelixUserData = await hx.user(headers);
		userBody = userResponse.data[0];
	} catch (err) {
		log.error(
			`during login: user query returned an error: ${(err as Error).name} - ${(err as Error).message}`,
		);
        let msg;
        if (err instanceof TypeError) {
            msg = 'issue reading user data from Twitch';
        } else {
            msg = 'issue fetching user data from Twitch';
        }
		throw error(
			401,
            msg,
		);
	}

	try {
		const colorResponse: HelixColorData = await hx.colors(
			headers,
			userBody.id,
		);
		color = colorResponse.data[0].color;
	} catch (err) {
		log.error(
			`during login: color query returned an error:${(err as Error).name} - ${(err as Error).message}`,
		);
        let msg;
        if (err instanceof TypeError) {
            msg = 'issue reading user data from Twitch';
        } else {
            msg = 'issue fetching user data from Twitch';
        }
		throw error(
			401,
			`issue fetching user data from Twitch`,
		);
	}

	const user: UserInsert = {
		id: userBody.id,
		login: userBody.login,
		display_name: userBody.display_name,
		description: userBody.description,
		profile_image_url: userBody.profile_image_url,
		created_at: userBody.created_at,
		last_sync: new Date(),
		color,
	};

	makeNewUser(user, tokens);
	const sessionId = generateSessionToken();
	const session = await createSession(sessionId, user.id);

	setSessionCookie(event, sessionId, new Date(session.session_expiry));
	return {
		user,
	};
};

async function validateCallbackEvent(event: RequestEvent) {
	// response should always contain a matching state (even if response is an error)
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('_state') ?? null;
	if (!state || state !== storedState) {
		log.error(
			`state in callback was missing or didn't match stored value (recv: ${state}, expect: ${storedState})`,
		);
		throw error(400, "state in callback was missing or didn't match stored value");
	}

	const err = event.url.searchParams.get('error');
	const description = event.url.searchParams.get('error_description');
	if (err && description) {
		log.error(
			`error in callback response: '${err}' -> ${description}`,
		);
		throw error(
			400,
			`oauth response contained an error`,
		);
	}

	const code = event.url.searchParams.get('code');
	if (!code) {
		log.error('Code parameter missing from callback response');
		throw error(400, 'Code parameter was missing from oauth callback response');
	}

	return code;
}
