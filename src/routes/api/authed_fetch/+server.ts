import type { RequestEvent } from "./$types";

export const GET = async (event: RequestEvent): Promise<Response> => {
    const userId = event.locals.user?.id;
    const twitchId = event.locals.user?.twitch_id;
    const broadcasterId = event.url.searchParams.get('bcid');

    if (!userId || !twitchId) {
        return new Response(JSON.stringify({ error: true, message: 'no local user or twitch id'}), {
            status: 400,
        });
    }

    if (!broadcasterId) {
        return new Response(JSON.stringify({ error: true, message: 'no broadcaster id search parameter'}), {
            status: 400,
        });
    }

    return new Response(null, {
        status: 500,
    })
}

