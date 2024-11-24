import { TWITCH_CLIENT_ID } from '$env/static/private';
import { log } from '$logging';

export const SCOPES = ['user:read:follows', 'user:read:subscriptions'];
export const HELIX = {
	USER: 'https://api.twitch.tv/helix/users',
	COLOR: 'https://api.twitch.tv/helix/chat/color',
	BADGES: 'https://api.twitch.tv/helix/chat/badges',
	CHANNEL: 'https://api.twitch.tv/helix/channels',
	FOLLOWED: 'https://api.twitch.tv/helix/channels/followed',
	SUBSCRIPTIONS: 'https://api.twitch.tv/helix/subscriptions/user',
};

export const PASSPORT = {
	OAUTH: 'https://id.twitch.tv/oauth2/token',
	REVOKE: 'https://id.twitch.tv/oauth2/revoke',
	VALIDATE: 'https://id.twitch.tv/oauth2/validate',
};

export enum AuthorizationPrefix {
	Bearer,
	OAuth,
}

/**
 * Creates Auth headers from a user's access token
 * @param token - Twitch OAuth access token (or global token for GQL)
 * @param authType - Which `Authorization` prefix to use ('`Bearer`' (default) for Helix, '`OAuth`' for GQL)
 * @param client - Assigns a value to the `Client-Id` header field ('`TWITCH_CLIENT_ID`' (default) for Helix, '`TWITCH_CLIENT_BROWSER`' for GQL)
 * @param extended - Additional header fields to include in the request
 * @returns Headers containing an 'Authorization' field populated by the user's OAuth token, plus other necessary information
 */
export function authorizedHeadersFrom(
	token: string,
	prefix: 'Bearer' | 'OAuth' = 'Bearer',
	client: string = TWITCH_CLIENT_ID,
	extended: Record<string, string>[] | null = null,
): Headers {
	console.log('t->', token, 'p->', prefix, 'c->', client, 'e->', extended);
	const headers: Headers = new Headers({
		Authorization: `${prefix} ${token}`,
		'Client-Id': client,
	});

	if (extended !== null) {
		extended.forEach((record) => {
			Object.entries(record).forEach(([key, val]) => {
				headers.append(key, val);
			});
		});
	}

	return headers;
}
