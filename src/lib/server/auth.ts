import { dev } from '$app/environment';
import {
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_CALLBACK_URI,
} from '$env/static/private';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { db } from '@server/db';
import { Twitch } from 'arctic';
import { Lucia } from 'lucia';

export const twitch = new Twitch(
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_CALLBACK_URI
);

const adapter = new BetterSqlite3Adapter(db, {
	user: 'user',
	session: 'session',
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes: (attr) => {
		return {
			twitch_id: attr.twitch_id,
			login: attr.login,
			display_name: attr.display_name,
			profile_image_url: attr.profile_image_url,
			access: attr.access,
			refresh: attr.refresh,
			refresh_after: attr.refresh_after,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			id: string;
			twitch_id: string;
			login: string;
			display_name: string;
			profile_image_url: string;
			access: string;
			refresh: string;
			refresh_after: string;
		};
	}
}
