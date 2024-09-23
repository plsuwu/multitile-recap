import { twitch, lucia } from '@server/auth';
import RedisCacheWorker from '@server/cache';
import { buildAuthorizedHeader } from '@server/utility';
import type { RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError, Twitch } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';

const HELIX = {
    USER: 'https://api.twitch.tv/helix/users',
    COLOR: 'https://api.twitch.tv/helix/chat/color',
};


export const GET = async (event: RequestEvent): Promise<Response> => {
    const code = event.url.searchParams.get('code');
    const state = event.url.searchParams.get('state');
    const storedState = event.cookies.get('oauth_state') ?? null;

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, { status: 400 });
    }

    const worker = new RedisCacheWorker({});
    try {
        let tokens = await twitch.validateAuthorizationCode(code);
        const headers = buildAuthorizedHeader(tokens.accessToken);

        const userRequest = await fetch(HELIX.USER, { headers: headers });
        const user = await userRequest.json();
        const twitchUser = user.data[0];
        const exists = await worker.readTwitchUser(twitchUser.id);

        if (exists) {
            const session = await lucia.createSession(exists, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes
            });

        } else {
            const userId = generateIdFromEntropySize(10); // 16 chars; locally stored user ref id
            const { id, login, display_name, profile_image_url } = twitchUser;

            const userColorRequest = await fetch(
                `${HELIX.COLOR}?user_id=${id}`,
                { headers: headers }
            );
            const userColorResponse = await userColorRequest.json();
            const color = userColorResponse.data[0].color;

            const cachedUser = {
                id: userId, // lucia token  - used for internal queries
                twitch_id: id, // twitch uid   - used for twitch-based referential data
                login,
                display_name,
                profile_image_url,
                color,
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
                refresh_after:
                    Date.parse(tokens.accessTokenExpiresAt.toString()),

            };
            await worker.writeUser<TwitchUser>(userId, { ...cachedUser });

            const session = await lucia.createSession(userId, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        }

        worker.close();
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
            },
        });
    } catch (err) {
        worker.close();
        console.error(err);

        if (err instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400
            });
        }

        return new Response(null, {
            status: 500,
        });
    }
};
