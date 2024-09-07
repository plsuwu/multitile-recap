import { redirect, type LoadEvent, type ServerLoadEvent } from "@sveltejs/kit";
import type { RequestEvent } from "../../routes/$types";

export const why: Record<number, string> = {
    0: 'authentication required',
    1: 'session was invalid or malformed, try logging in again.',
    2: 'a response was returned from an external source that this server couldn\'t understand.',
    3: 'an unhandled error occurred, try again later.',
}

export function redirectErrorConstructor(reason: number, event: ServerLoadEvent | RequestEvent | any) {
        const ref = why[reason];
        const construct = event.url.pathname.concat('::', ref);

        event.cookies.set('error', construct, {
            path: '/',
            secure: import.meta.env.PROD,
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: 'lax',
        });

        redirect(307, '/');
}
