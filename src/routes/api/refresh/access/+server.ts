import { twitch } from "@server/auth";
import type { RequestEvent } from "../$types";
import RedisCacheWorker from "@server/cache";


export const GET = async (event: RequestEvent): Promise<Response> => {
    const userId = event.locals.user?.id;
    const refresh = event.locals.user?.refresh;
    if (!userId || !refresh) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Invalid or missing credentials',
            }),
            {
                status: 400,
            }
        );
    }

    const refreshAfter = event.locals.user?.refresh_after;
    if (!refreshAfter) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'Unable to determine the refresh period'
            }),
            {
                status: 401,
            }
        );
    }
    if (Number(refreshAfter) > Date.now()) {
        return new Response(
            JSON.stringify({
                error: true,
                message:
                    `Token shouldn't not require refreshing` +
                    `(valid until ${new Date(refreshAfter).toISOString()})`,
            }),
            {
                status: 200,
            },
        );
    }

    const refreshed = await twitch.refreshAccessToken(refresh);
    const refreshedUser = {
        id: userId,
        twitch_id: event.locals.user?.twitch_id,
        login: event.locals.user?.login,
        color: event.locals.user?.color,
        profile_image_url: event.locals.user?.profile_image_url,
        display_name: event.locals.user?.display_name,
        access: refreshed.accessToken,
        refresh: refreshed.refreshToken,
        refresh_after: Date.parse(
            refreshed.accessTokenExpiresAt.toString()
        ),
    };

    const worker = new RedisCacheWorker({});
    await worker.delete(userId);
    await worker.writeUser(userId, refreshedUser);
    worker.close();

    return new Response(null, {
        status: 200,
    });
}
