import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from '@sveltejs/kit';
import type { DatabaseUser } from 'lucia';
import { tokenIsSanitary, tokenIsValid } from './utils';

export const POST = async (event: RequestEvent): Promise<Response> => {
    const { token } = await event.request.json();
    const userId = event.locals.user?.id;
    const twitchId = event.locals.user?.twitch_id;

    if (!token || !userId || !twitchId) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Invalid or missing credentials'
            }), {
            status: 400,
        });
    }

    if (!tokenIsSanitary(token)) {
        return new Response(
            JSON.stringify({
                error: true,
                mesage: 'Invalid characters in token',
            }),
            {
                status: 401,
            }
        );
    }

    const valid = await tokenIsValid(token, twitchId);
    if (valid.error) {
        return new Response(
            JSON.stringify({
                error: true,
                message: `Token invalid for user ${userId}: ${valid.message} (see 'details' field)`,
                details: valid,
            }),
            {
                status: 401,
            });
    }

    const worker = new RedisCacheWorker({});

    // not sure why this would happen but i did it for a reason ??
    //
    // const cached = await worker.readUser<DatabaseUser>(userId);
    // if (!cached) {
    //     return new Response(
    //         JSON.stringify({
    //             error: true,
    //             message: `User ${userId} has no cached user information`
    //         }),
    //         {
    //             status: 404,
    //         }
    //     );
    // }

    worker.writeTempAuth(userId, token);
    worker.close();

    return new Response(
        JSON.stringify({
            error: false,
            message: null
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
};
