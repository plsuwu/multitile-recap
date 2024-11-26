import type { RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { log } from "$logging";


export async function load (event: RequestEvent) {

    const { user } = event.locals;

    return {
        user,
    }
}
