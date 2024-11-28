import { pg } from "$server/postgres/postgres";
import { json, redirect, type RequestEvent } from "@sveltejs/kit";

export const load = async (event: RequestEvent) => {
    const { user } = event.locals;
    if (!user) {
        redirect(302, '/');
    }

    const followed = await pg.select.follows(user.id);

    return {
        user,
        followed,
    };
}

