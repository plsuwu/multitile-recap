import { dev } from "$app/environment";
import { HELIX } from "$server/helix/utils";
import { redirect, type Actions, type RequestEvent } from "@sveltejs/kit";

export const load = async (event: RequestEvent) => {
    const { user } = event.locals;
    if (!user || !dev) {
        redirect(302, '/');
    }

    return {
        user,
    }
}

export const actions = {
    enqueue: async (event) => {
        // post endpoint data to '/api/data/enqueue' route;
        const endpoints = [`${HELIX.FOLLOWED}?user_id=${event.locals.user?.id}`, `${HELIX.SUBSCRIPTIONS}`];
        const test_post = await event.fetch('/api/data/enqueue', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ endpoints }),
        });

        console.log('[*] resolved test_post response:', await test_post.json());
    },

    status: async (event) => {
        const statusRes = await event.fetch(`/api/data/status/${event.locals.user?.id}`, {
            method: 'GET',
        });

        const body = await statusRes.json();
        console.log('[*] job status:', body);
    }
} satisfies Actions;


