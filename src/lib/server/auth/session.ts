import { makeEncodedPayload } from '$client/utils';
import { TWITCH_CLIENT_ID } from '$env/static/private';
import { helix } from '$helix';
import { log } from '$logging';
import { SESSION } from '$logging/constants';
import redis from '$redis';
import { PASSPORT } from '$server/helix/utils';
import type { TwitchUser, TwitchTokens, SessionData, Session } from '$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import { deleteSessionCookie } from './cookie';
import { twitch } from './provider';
import { sha256 } from '@oslojs/crypto/sha2';
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase,
} from '@oslojs/encoding';
import { OAuth2RequestError, type OAuth2Tokens } from 'arctic';

const DEFAULT_EXPIRY_FULL = 1000 * 60 * 60 * 30;
const DEFAULT_EXPIRY_HALF = 1000 * 60 * 60 * 15;
const DEFAULT_REVALIDATE = 1000 * 60 * 60 * 4;
const NULL_SESSION: Session = {
    user: null,
    tokens: null,
    session: null,
};

/**
 * Creates a lowercase hex representation of a SHA256 hash of a user's cookie token
 * @param token - Unhashed session token
 * @returns SHA256 hash of input string
 */
const getSessionTokenHash = (token: string) => {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
};

/**
 * Adds a new entry under a given hashed session id
 * @param sessionId - Hash of a user's session token
 * @param session - The session object to be cached
 */
async function setSession(sessionId: string, session: SessionData) {
    const key = `session:${sessionId}`;
    const pipeline = redis.redis.pipeline();

    pipeline.hmset(key, { ...session });
    pipeline.pexpire(key, session.session_expiry);
    await pipeline.exec();
}

/**
 * Updates validation control values for a given session in Redis and client cookie
 * @param sessionId - Hash of a user's session token
 * @param newExpiry - New expiration time (set on cookie and the hash `EX`)
 * @param newRevalidation - New revalidation time
 */
async function persistSession(
    sessionId: string,
    userId: string,
    newExpiry?: number,
    newRevalidation?: number,
    newAccessExpiry?: number,
) {
    // if neither a new expiry nor revalidation timestamp are passed, return immediately
    if (!newExpiry && !newRevalidation && !newAccessExpiry) {
        return;
    }

    const sessionKey = `session:${sessionId}`;
    const tokensKey = `tokens:${userId}`;
    const pipeline = redis.redis.pipeline();

    if (newRevalidation) {
        log.info(SESSION(sessionId).GENERAL.PERSISTING_REVALIDATE);
        pipeline.hset(sessionKey, { revalidate_access: newRevalidation });
    }

    if (newExpiry) {
        log.info(SESSION(sessionId).GENERAL.PERSISTING_SESSION);
        pipeline.hset(sessionKey, { session_expiry: newExpiry });
        pipeline.pexpire(sessionKey, newExpiry);
    }

    if (newAccessExpiry) {
        log.info(SESSION(sessionId).GENERAL.PERSISTING_REFRESH);
        pipeline.hset(tokensKey, { expiry: newAccessExpiry });
    }

    await pipeline.exec();
}

async function deleteSession(sessionId: string) {
    const key = `session:${sessionId}`;
    await redis.redis.del(key);
}

/**
 * invalidates a session by deleting it from the cache
 * @param acccess - Twitch-issued OAuth2 access token
 * @param sessionId - Hash of a user's session token
 */
export async function invalidateSession(event: RequestEvent) {
    const sessionId = event.cookies.get('_session');

    if (!event.locals.tokens || !event.locals.tokens.access || !sessionId) {
        throw error(400, 'Cannot logout');
    }

    const data = {
        client_id: TWITCH_CLIENT_ID,
        token: event.locals.tokens.access,
    };

    const response = await fetch(PASSPORT.REVOKE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: makeEncodedPayload(data),
    });

    if (!response.ok) {
        let errorReason = '';
        if (response.status === 400) {
            errorReason = 'invalid token';
        } else if (response.status === 404) {
            errorReason = 'client or user does not exist';
        }

        console.error(
            `[!] Unable to revoke token: ${errorReason} (${response.status})`,
        );
    }

    deleteSessionCookie(event);
    await deleteSession(sessionId);
}

export function generateSessionToken() {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);

    return encodeBase32LowerCaseNoPadding(bytes);
}

/**
 * Creates and caches a new session for a given user
 * @param token - Un-hashed user token
 * @param userId - User's Twitch ID
 * @returns a new `Session` object
 */
export async function createSession(token: string, userId: string) {
    const sessionId = getSessionTokenHash(token);
    const session: SessionData = {
        user_id: userId,
        session_expiry: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
        revalidate_access: Date.now() + 1000 * 60 * 60 * 4, // revalidate access token every four hours
    };

    // we probably dont care to await this asynchronous call as we
    // return the session data directly, so we shouldn't need to read
    // this straight away (right?)
    setSession(sessionId, session);
    return session;
}

export async function validateSession(token: string): Promise<Session> {
    let recache = false; // track if we should update cached expiry times

    const sessionId = getSessionTokenHash(token);
    const cache = await redis.getSessionFromCache<SessionData>(sessionId);

    /**
     * cached session data check
     */
    if (!cache) {
        log.info(SESSION(sessionId).GENERAL.CACHE_MISS_SESSION);
        return NULL_SESSION;
    }

    /**
     * cached session expiry check
     */
    if (Date.now() >= cache.session_expiry) {
        log.warn(SESSION(sessionId).GENERAL.EXPIRED);
        deleteSession(sessionId);
        return NULL_SESSION;
    }
    if (Date.now() >= cache.session_expiry - DEFAULT_EXPIRY_HALF) {
        log.warn(SESSION(sessionId).GENERAL.PERSIST);
        cache.session_expiry = Date.now() + DEFAULT_EXPIRY_FULL; // update expiry value to persist
        recache = true;
    }

    /**
     * cached user, tokens data check
     */
    let user = await redis.getUserFromCache<TwitchUser>(cache.user_id);
    let tokens = await redis.getTokensFromCache<TwitchTokens>(cache.user_id);

    if (!user || !tokens) {
        log.warn(SESSION(sessionId).GENERAL.CACHE_MISS_USER);
        console.warn('[?] `tokens` & `user` should have a definition when a cookie is set, so this likely indicates an issue with the validation logic.');
        return NULL_SESSION;
    }

    /**
     * cached tokens expiry check
     */
    if (Date.now() >= tokens.expiry) {
        log.warn(SESSION(sessionId).GENERAL.REQUIRE_REFRESH);

        let newTokens: OAuth2Tokens;
        try {
            newTokens = await twitch.refreshAccessToken(tokens.refresh);
            tokens = {
                refresh: newTokens.refreshToken(),
                access: newTokens.accessToken(),
                expiry: newTokens.accessTokenExpiresAt().getTime(),
            };

            recache = true;
        } catch (err) {
            if (err instanceof OAuth2RequestError) {
                log.error(SESSION(sessionId).ERROR.REFRESH_OAUTH2);
            } else {
                log.error(SESSION(sessionId).ERROR.UNHANDLED);
            }
            await deleteSession(sessionId);
            return NULL_SESSION;
        }
    }

    /**
     * cached token validity check
     */
    if (Date.now() >= cache.revalidate_access) {
        log.warn(SESSION(sessionId).GENERAL.REQUIRE_REVALIDATE);

        const headers = helix.authorizedHeadersFrom(tokens.access);
        const revalidateResponse = await fetch(PASSPORT.VALIDATE, {
            method: 'GET',
            headers: headers,
        });

        // should refresh token
        if (revalidateResponse.status === 401) {
            log.error(SESSION(sessionId).ERROR.REVALIDATION_UNAUTHORIZED);
            log.error('i assume that we shouldn\'t ever see this warning - double check revalidation func (response.status === 401).');

            // this shouldn't happen so i won't bother handling this until
            // i see it happen
            return NULL_SESSION;
        } else if (!revalidateResponse.ok) {
            log.error(
                SESSION(sessionId).ERROR.UNHANDLED(
                    new Error(
                        `${revalidateResponse.status} - ${revalidateResponse.statusText}`,
                    ),
                ),
            );
        }

        // update with next revalidation time
        cache.revalidate_access = Date.now() + DEFAULT_REVALIDATE;
        recache = true;
    }

    if (recache === true) {
        // dont bother awaiting this promise as we return the
        // updates directly
        persistSession(
            sessionId,
            cache.user_id,
            cache.session_expiry,
            cache.revalidate_access,
            tokens.expiry,
        );
    }

    return {
        user,
        tokens,
        session: cache,
    };
}
