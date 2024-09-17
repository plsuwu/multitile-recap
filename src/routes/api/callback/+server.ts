import { twitch, lucia } from '@server/auth';
import RedisCacheWorker from '@server/cache';
import { buildAuthorizedHeader } from '@server/utility';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError, Twitch } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';

const HELIX = {
    USER: 'https://api.twitch.tv/helix/users',
    MOCK: 'http://localhost:8080/users',
};

interface TwitchUser {
    id: string;
    twitch_id: string;
    login: string;
    display_name: string;
    profile_image_url: string;
    access: string;
    refresh: string;
    refresh_after: number;
}

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

    const worker = new RedisCacheWorker({});
    try {
        let tokens = await twitch.validateAuthorizationCode(code);
        const headers = buildAuthorizedHeader(tokens.accessToken);

        const userRequest = await fetch(HELIX.USER, {
            headers: headers,
        });

        const user = await userRequest.json();
        const twitchUser = user.data[0];
        const exists = await worker.readUser<TwitchUser>(twitchUser.id);

        if (!exists) {
            const userId = generateIdFromEntropySize(10); // 16 chars
            const { id, login, display_name, profile_image_url } = twitchUser;

            const cachedUser = {
                id: userId,             // lucia token - referenced in client cookies
                twitch_id: id,          // twitch uid - actually what matters
                login,
                display_name,
                profile_image_url,
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
                refresh_after: Number(tokens.accessTokenExpiresAt) - Number(Date.now()),
            };

            await worker.writeUser<TwitchUser>(userId, { ...cachedUser });

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
        console.error(err);
        return new Response(null, {
            status: 400,
            headers: {
                Location: '/',
            },
        });
    }
};
