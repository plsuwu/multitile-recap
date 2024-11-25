import { HELIX } from "$server/helix/utils";
import type { Actions, RequestEvent } from "@sveltejs/kit";

export const load = async (event: RequestEvent) => {
    const { user } = event.locals;
    if (!user) {
        return {};
    }

    return {
        user,
    }
}

export const actions = {
    enqueue: async (event) => {
        // post endpoint data to '/api/data/enqueue' route;
        const endpoints = [`${HELIX.FOLLOWED}?user_id=${event.locals.user?.id}`];
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


