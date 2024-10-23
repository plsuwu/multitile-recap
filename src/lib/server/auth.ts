import { dev } from '$app/environment';
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_CALLBACK_URI } from '$env/static/private';
import { Twitch } from 'arctic';
import { Lucia } from 'lucia';
import { adapter } from '$lib/server/cache';

export const twitch = new Twitch(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_CALLBACK_URI);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    },
    getUserAttributes: (attr) => {
        return {
            ttv_user: { ...attr.ttv_user },
            tokens: { ...attr.tokens }
        };
    }
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            id: string;
            ttv_user: {
                id: string;
                login: string;
                display_name: string;
                profile_image_url: string;
                color: string;
            };
            tokens: {
                access: string;
                refresh: string;
                expiry: string;
            };
        };
    }
}
