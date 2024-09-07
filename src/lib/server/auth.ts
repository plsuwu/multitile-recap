import {
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_CALLBACK_URI
} from '$env/static/private';
import { Twitch } from 'arctic';
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { BunSQLiteAdapter } from '@lucia-auth/adapter-sqlite';
import { Database } from 'bun:sqlite';

export const twitch = new Twitch(
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_CALLBACK_URI
);

export const db = new Database(':memory:'); // in-memory db
db.run(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    twitch_id TEXT NOT NULL,
    login TEXT NOT NULL,
    display_name TEXT NOT NULL,
    profile_image_url NOT NULL,
    access TEXT NOT NULL,
    refresh TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS subs_cache (
    user_id TEXT NOT NULL PRIMARY KEY,
    subs_data TEXT NOT NULL,
    follows_data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

const adapter = new BunSQLiteAdapter(db, {
	user: 'user',
	session: 'session'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attr) => {
		return {
			twitch_id: attr.twitch_id,
			login: attr.login,
			display_name: attr.login,
			profile_image_url: attr.profile_image_url,
			access: attr.access,
			refresh: attr.refresh
		};
	}
});

// push subdata to the cache
export function cacheTTVData(
	userId: string,
	twitchId: string,
	subscriptionsData: any,
	followsData: any
) {
	const query = db.query(
		`INSERT INTO subs_cache (user_id, subs_data, follows_data, created_at) VALUES ($user_id, $subs_data, $follows_data, $created_at);`
	);
	query.all({
		$user_id: userId,
		$twitch_id: twitchId,
		$subs_data: JSON.stringify(subscriptionsData),
		$follows_data: JSON.stringify(followsData),
		$created_at: +Date.now()
	});
}

// fetch the subdata from the cache and validate it
export function getCachedTTVData(
	userId: string
): null | { subs: JSON; follows: JSON } {
	const query = db.query(`SELECT * FROM subs_cache WHERE user_id = $user_id;`);
	const res = query.get({ $user_id: userId }) as {
		user_id: string;
		twitch_id: string;
		subs_data: string;
		follows_data: string;
		created_at: number;
	};

	if (res) {
		if (+Date.now() - res.created_at < 300000) {

            // parse & return json if the data is < about 5 mins old
			let subs = JSON.parse(res.subs_data);
			let follows = JSON.parse(res.follows_data);

			return { subs, follows };
		} else {

			// otherwise delete the cached sub data and return null
			db.prepare(`DELETE FROM subs_cache WHERE user_id = $user_id`).run({
				$user_id: userId
			});
		}
	}

	return null;
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			twitch_id: string;
			login: string;
			display_name: string;
			profile_image_url: string;
			access: string;
			refresh: string;
		};
	}
}
