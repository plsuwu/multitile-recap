import { session as s } from '$auth';
import { deleteSessionCookie, setSessionCookie } from '$auth/cookie';
import { log } from '$logging';
import { HOOK } from '$logging/constants';

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

function logPrefix(
	routeId: string | null,
	type: 'update' | 'error',
	id?: string,
) {
	const eventType = type === 'update' ? '+' : '!';
	const message = `[${eventType}] ['${routeId}']`.padEnd(27, ' ');

	return message;
}

const authHandle: Handle = async ({ event, resolve }) => {
	const routeId = event.route.id ?? '**UNKNOWN_RT**';
    log.debug(routeId);
    log.info(HOOK(routeId).GENERAL.HOOK_START);
    const token = event.cookies.get('_session') ?? null;

	if (token === null) {
		log.debug(HOOK(routeId).GENERAL.UNSET_COOKIE);
		log.debug(HOOK(routeId).GENERAL.HOOK_END('NO_SESSION_COOKIE'));

		event.locals.user = null;
		event.locals.tokens = null;
		event.locals.session = null;

		return resolve(event);
	} else if (!token) {
		log.error(HOOK(routeId).GENERAL.UNDEFINED_COOKIE_VALUE);
		log.error(HOOK(routeId).GENERAL.HOOK_END('MALFORMED_SESSION_TOKEN'));

		event.locals.user = null;
		event.locals.tokens = null;
		event.locals.session = null;

		deleteSessionCookie(event);
		return resolve(event);
	}

	let { user, tokens, session } = await s.validateSession(token);
	if (session === null) {
		log.debug(HOOK(routeId).GENERAL.INVALID_SESSION);
		deleteSessionCookie(event);
	} else {
		try {
			setSessionCookie(event, token, new Date(session.session_expiry));
            log.debug(`${event.cookies.get('_session')}`);
		} catch (err) {
            console.error(err);
			log.debug(HOOK(routeId).ERROR.SETTING_COOKIE(err as Error));
			deleteSessionCookie(event);

			log.debug(
				HOOK(routeId).GENERAL.HOOK_END('MALFORMED_SESSION_TOKEN'),
			);
			return resolve(event);
		}
		event.locals.user = user;
		event.locals.tokens = tokens;
		event.locals.session = session;
		log.debug(HOOK(routeId).GENERAL.SESSION_OK);
	}

	log.debug(HOOK(routeId).GENERAL.HOOK_END('OK'));
	return resolve(event);
};

export const handle = sequence(authHandle);
