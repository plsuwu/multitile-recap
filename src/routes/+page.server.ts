import { HELIX } from "$server/helix/utils";
import type { RequestEvent } from "@sveltejs/kit";

export const load = async (event: RequestEvent) => {
    const ref = event.request.headers.get('referer');
    const search = event.url.searchParams;
    // console.log(ref?.slice(0, 39), search);

    if (ref?.slice(0, 39) === 'http://localhost:5173/api/auth/callback' && search) {

        const endpoints = [`${HELIX.FOLLOWED}?user_id=${event.locals.user?.id}`];
        const syncFollowed = await event.fetch('/api/data/enqueue', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ endpoints }),
        });

        return {
            sync: true,
        }
    }

    return {
        sync: false,
    };
}
