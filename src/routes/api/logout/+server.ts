import type { RequestEvent } from '@sveltejs/kit';
import { lucia } from '@server/auth';
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

        return new Response(
            JSON.stringify({
                error: true,
                message: 'Invalid or missing credentials',
            }),
            {
                status: 300,
                headers: {
                    Location: '/?err=missing%20credentials',
                },
            }
        );
    }

    const worker = new RedisCacheWorker({});
    let result: {
        error: boolean,
        message: string,
        location: string,
        status: number
    } = {
        error: false,
        message: '',
        location: '/',
        status: 200
    };

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
                    result = {
                        error: true,
                        message: 'Token already invalid',
                        location: '/?err=already%20revoked',
                        status: 400,
                    };
                    break;

                case 404:
                    result = {
                        error: true,
                        message: 'Client not found',
                        location: '/?err=client_id%20not%20found',
                        status: 404,
                    };
                    break;

                default:
                    result = {
                        error: true,
                        message: "Twitch's API responded with an undocumented status code",
                        location: '/?err=remote%20unknown%20response',
                        status: revoke.status,
                    };
                    break;
            }
        }


        worker.close();
        await lucia.invalidateSession(sessionId);
        if (result.error) {
            console.error('[!] Error response during token revocation: ', result.message);

            const { error, message, status } = result;
            return new Response(
                JSON.stringify({ error, message, status }),
                {
                    status: 300,
                    headers: {
                        Location: '/?err=remote%20error',
                    },
                },
            );
        }

        return new Response(
            JSON.stringify({ error: false, messsage: 'ok' }),
            {
                status: 302,
                headers: {
                    Location: '/',
                },
            }
        );

    } catch (err) {
        worker.close();
        console.error('[!] Unable to revoke token:', err);
        return new Response(
            JSON.stringify({
                error: true,
                message: `Unhandled error: ${err} (see 'details' field)`,
                status: 500,
                details: err,
            }),
            {
                status: 300,
                headers: {
                    Location: '/?err=unhandled%20error',
                },
            }
        );
    }
}
