import { TWITCH_CLIENT_ID } from '$env/static/private';
import type { CacheData } from '../types';
import RedisCacheWorker from './cache';

const checkSessionLocals = async (locals: App.Locals, fetch: typeof globalThis.fetch) => {

    const access = locals.user?.access;
    const twitchId = locals.user?.twitch_id;
    const userId = locals.user?.id;
    const sessionId = locals.session?.id;

    if (!access || !sessionId || !twitchId || !userId) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Missing client credentials',
                location: '/?err=missing%20client%20credentials',
            }),
            {
                status: 400,
            }
        );
    }

    const expires = locals.user?.refresh_after;
    if (expires && Number(expires) < Date.now()) {
        const refreshedToken = await fetch('/api/refresh/access', {
            method: 'GET',
        });

        if (!refreshedToken.ok) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Failed to refresh access token',
                location: '/?err=refresh%20failed',
            }),
            {
                status: 400,
            }
        );

        }
    }

    return new Response(
        JSON.stringify({ id: userId }),
        {
            status: 200,
        }
    )

}

const buildAuthorizedHeader = (
	token: string,
	useOAuth: boolean = false,
	clientType: string = TWITCH_CLIENT_ID,
	exHeaderArgs: Record<string, string>[] | null = null
): Headers => {
	const headerType = useOAuth ? 'OAuth' : 'Bearer';
	const headers: Headers = new Headers({
		Authorization: `${headerType} ${token}`,
		'client-id': clientType,
	});

	if (exHeaderArgs) {
		exHeaderArgs.forEach((head) => {
			Object.entries(head).forEach(([key, value]) => {
				headers.append(key, value);
			});
		});
	}

	// console.log(headers);
	return headers;
};

export { buildAuthorizedHeader, checkSessionLocals };
