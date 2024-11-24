import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { log } from "$logging";
import { invalidateSession } from "$server/auth/session";
import { invalidateAll } from "$app/navigation";

export async function load(event: RequestEvent) {

    const sessionCookie = event.cookies.get('_session');
    if (!sessionCookie) {
        redirect(302, '/');
    }

    await invalidateSession(event);

    return {
        user: null,
    }
}
