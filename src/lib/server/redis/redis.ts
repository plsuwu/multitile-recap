import {
	REDIS_CONTAINER_HOST,
	REDIS_CONTAINER_PORT,
} from '$env/static/private';
import { log } from '$logging';
import type { SessionData, TwitchTokens, TwitchUser } from '$types';
import { Redis } from 'ioredis';

interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	ttl?: number;
}

const REDIS_URL = process.env.PRODUCTION ? REDIS_CONTAINER_HOST : 'localhost';
const REDIS_PORT = process.env.PRODUCTION ? Number(REDIS_CONTAINER_PORT) : 6379;

export enum KeyPrefix {
	Session,
	User,
	Tokens,
}

export class RedisHandler {
	public redis: Redis;
	private readonly ttl: number = 2592000; // key EXPIRE time default at 30 days (in seconds)

	constructor(config: RedisConfig) {
		this.redis = new Redis({
			host: config.host,
			port: config.port,
			password: config.password,
		});
	}

	private getKey(prefix: 'user' | 'tokens' | 'session', suffix: string) {
		return `${prefix}:${suffix}`;
	}

	/** ---------- getters ----------- */

	/**
	 * Returns an associated session given a session id
	 * @param sessionId - Hash of a user's session token
	 * @returns A session object corresponding to the given sessionId, or null otherwise
	 */
	public async getSessionFromCache<T = SessionData>(sessionId: string): Promise<T | null> {
		const key = this.getKey('session', sessionId);
		const session = await redis.redis.hgetall(key);
		log.debug(
			`@ REDIS: 'hgetall' for session using key '${key} returned hash for user '${session.user_id}'`
		);

		if (!session) {
			return null;
		}

        return {
            user_id: session.user_id,
            session_expiry: Number(session.session_expiry),
            revalidate_access: Number(session.revalidate_access),
        } as T
	}

	public async getUserFromCache<T = TwitchUser>(
		userId: string,
	): Promise<T | null> {
		const key = this.getKey('user', userId);
		const user = await this.redis.hgetall(key);

		log.debug(
			`@ REDIS: 'hgetall' for user using key '${key} returned hash for user '${user.id}'`,
		);
		if (!user) {
			return null;
		}

		return {
			id: user.id,
			display_name: user.display_name,
			login: user.login,
			profile_image_url: user.profile_image_url,
			color: user.color,
		} as T;
	}

	public async getTokensFromCache<T = TwitchTokens>(
		id: string,
	): Promise<T | null> {
		const key = this.getKey('tokens', id);
		const tokens = await this.redis.hgetall(key);
		log.debug(
			`@ REDIS: 'hgetall' for tokens using key '${key}' returned hash for token '${new Array(tokens.access.length).fill('*').join('')}'`,
		);

		if (!tokens) {
			return null;
		}

		return {
			access: tokens.access,
			refresh: tokens.refresh,
			expiry: Number(tokens.expiry),
		} as T;
	}

	/** ---------- setters ----------- */

	public async setCacheSession(
		suffix: string,
		data: SessionData,
	): Promise<void> {
		const key = this.getKey('session', suffix);
		if (await this.redis.exists(key)) {
			log.debug(`@ REDIS: @ 'set_InCache': '${key}' already exists`);
			log.debug(
				'(current function is to run the hset operation and overwrite)',
			);
		}
		const pipeline = this.redis.pipeline();

		pipeline.hset(key, data);
		pipeline.expire(key, this.ttl); // 30 days
		await pipeline.exec();
	}

	public async setCacheUser(suffix: string, data: TwitchUser): Promise<void> {
		const key = this.getKey('user', suffix);
		if (await this.redis.exists(key)) {
			log.debug(`@ REDIS: @ 'set_InCache': '${key}' already exists`);
			log.debug(
				'(current function is to run the hset operation and overwrite)',
			);
		}

		// dont set EXPIRE for a user
		await this.redis.hset(key, data);
	}

	public async setCacheTokens(
		suffix: string,
		data: TwitchTokens,
	): Promise<void> {
		const key = this.getKey('tokens', suffix);

		if (await this.redis.exists(key)) {
			log.debug(`@ REDIS: @ 'set_InCache': '${key}' already exists`);
			log.debug(
				'(current function is to run the hset operation and overwrite)',
			);
		}

		const pipeline = this.redis.pipeline();

		pipeline.hset(key, data);
		pipeline.expire(key, this.ttl); // keep OAuth info for 30 days
		await pipeline.exec();
	}

	// idk this probably wont actually get used anyway
	// public async updateCacheData<T>(prefix: KeyPrefix, suffix: string, data: T) {
	//     const key = this.getKey(prefix, suffix);
	//
	//     log.debug(`@ REDIS: updating data on ${key}`);
	//
	//     const pipeline = this.redis.pipeline();
	//     pipeline.expire(key, this.ttl);
	//     await pipeline.exec();
	// }
}

export const redis = new RedisHandler({ host: REDIS_URL, port: REDIS_PORT });
