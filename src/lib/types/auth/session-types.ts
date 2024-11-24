/**
 * Internal session data - user identification and session currency
 * @property {string} user_id
 * @property {number} session_expiry
 * @property {number} revalidate_access
 * */
export interface SessionData {
	user_id: string;
	session_expiry: number;
	revalidate_access: number;
}

/**
 * Cached OAuth token information
 * @property {string} access
 * @property {string} refresh
 * @property {number} expiry
 * */
export interface TwitchTokens {
	access: string;
	refresh: string;
	expiry: number;
}

/**
 * Frequently implemented user information
 * @property {string} id
 * @property {string} display_name
 * @property {string} login
 * @property {string} profile_image_url
 * @property {string} color
 * */
export interface TwitchUser {
	id: string;
	display_name: string;
	login: string;
	profile_image_url: string;

	// not natively to HELIX.USER response objects
	color: string;
}

/**
 * event.locals session data
 * @property {TwitchUser | null} user
 * @property {TwitchTokens | null} tokens
 * @property {SessionData | null} session;
 * */
export interface Session {
	user: TwitchUser | null;
	tokens: TwitchTokens | null;
	session: SessionData | null;
}
