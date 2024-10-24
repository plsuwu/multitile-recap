import type { CachedUser } from '$lib/types';
import { json, type RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';

import RedisCacheWorker, { KeyType } from '$lib/server/cache';
import { twitch, lucia } from '$lib/server/auth';
import { buildAuthHeader } from '$lib/utils';
import { OAuthManager } from '$lib/internal';

// TODO: move to `constants` file and import?
const HELIX = {
	user: 'https://api.twitch.tv/helix/users',
	color: 'https://api.twitch.tv/helix/chat/color'
};

export const GET = async (event: RequestEvent): Promise<Response> => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('csrf') ?? null;

	if (!code || !state) {
		return json(
			{
				error: true,
				message: 'Missing credentials'
			},
			{ status: 400 }
		);
	}

	if (!storedState || state !== storedState) {
		return json(
			{
				error: true,
				message: 'Invalid CSRF'
			},
			{ status: 400 }
		);
	}

	const worker = new RedisCacheWorker({});

	try {
		let tokens = await twitch.validateAuthorizationCode(code);
		const helixHeader = buildAuthHeader(tokens.accessToken());
		const ttvUserRequest = await fetch(HELIX.user, { headers: helixHeader });
		const ttvUserResponse = await ttvUserRequest.json();
		const ttvUser = ttvUserResponse.data[0];

		const exists = await worker.readData<CachedUser>(ttvUser.id, KeyType.Ttv);

		if (exists) {
			// ... handle existing
            console.log('[*] USER EXISTS:', exists);

		} else {
			const luciaId = generateIdFromEntropySize(10); // 16 chars - internal session reference to cached twitch user data
			const { id, login, display_name, profile_image_url } = ttvUser;
			const ttvColorRequest = await fetch(`${HELIX.color}?user_id=${id}`, {
				headers: helixHeader
			});

			const ttvColorResponse = await ttvColorRequest.json();
			const ttvColor = ttvColorResponse.data[0].color;
			const cachedUser: CachedUser = {
				id: luciaId,
				ttv: {
					...ttvUser,
					color: ttvColor
				},
				tokens: {
					access: tokens.accessToken(),
					refresh: tokens.refreshToken(),
					expiry: Date.parse(tokens.accessTokenExpiresAt().toString()).toString(),
				}
			};
			await worker.writeData<CachedUser>(luciaId, KeyType.User, cachedUser);
            await worker.writeData<Record<string, any>>(cachedUser.ttv.id, KeyType.Ttv, { luciaId });
			worker.close();

			const session = await lucia.createSession(luciaId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		};

		return json(
			{
				error: false,
				message: null
			},
			{ status: 200 }
		);



	} catch (err) {
        worker.close();
        if (err instanceof OAuth2RequestError) {
            console.error('[!] OAuth2 error during login callback function: ', err);
            return json({
                error: true,
                message: 'OAuth2 error - refer to console output'
            }, { status: Number(err.code) })
        }

        console.error('[!] Unhandled eror during OAuth callback: ', err);
        return json({
            error: true,
            message: 'Unhandled error - refer to console output',
        }, { status: 500 });
    }
};
