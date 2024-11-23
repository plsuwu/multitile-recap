import type { RequestEvent } from '@sveltejs/kit';

/**
 * sets a clientside session cookie
 * @param event - event data associated with a given request
 * @param token - the unhashed session token
 * @param expiry - the time at which the session cookie should expire
 */
export function setSessionCookie(
	event: RequestEvent,
	token: string,
	expiry: Date,
): void {
	event.cookies.set('_session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiry,
		path: '/',
	});
}

/**
 * removes (i.e "un-sets") a clientside session cookie
 * @param event - event data associated with a given request
 */
export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.set('_session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/',
	});
}
