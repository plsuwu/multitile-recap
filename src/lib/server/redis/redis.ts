import {
	REDIS_CONTAINER_HOST,
	REDIS_CONTAINER_PORT,
} from '$env/static/private';
import { log } from '$logging';
import { Redis } from 'ioredis';

interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	ttl?: number;
}

const REDIS_URL = process.env.PRODUCTION ? REDIS_CONTAINER_HOST : 'localhost';
const REDIS_PORT = process.env.PRODUCTION ? Number(REDIS_CONTAINER_PORT) : 6379;

export class RedisHandler {
	public redis: Redis;
	public ttl: number;

	constructor(config: RedisConfig) {
		this.redis = new Redis({
			host: config.host,
			port: config.port,
			password: config.password,
		});

		this.ttl = config.ttl || 2592000; // key EX defaults to 30 days if no ttl set in config
	}

	private getKey(prefix: string, suffix: string) {
		return `${prefix}:${suffix}`;
	}

	public async getUserData<T>(id: string): Promise<T> {
		const user = await this.redis.hgetall(this.getKey('user', id));
		const tokens = await this.redis.hgetall(this.getKey('tokens', id));
		log.debug('REDIS: FETCHING USER DATA: RECV ->', user, tokens);

		if (!user || !tokens) {
			return { user: null, tokens: null } as T;
		}

		return { user, tokens } as T;
	}

	/**
	 * Returns an associated session given a session id
	 * @param sessionId - Hash of a user's session token
	 * @returns A session object corresponding to the given sessionId, or null otherwise
	 */
	public async getSession<T>(sessionId: string): Promise<T> {
		const key = this.getKey('session', sessionId);

		const session = await redis.redis.hgetall(key);
		if (!session) {
			return null as T;
		}

		return session as T;
	}
}

export const redis = new RedisHandler({ host: REDIS_URL, port: REDIS_PORT });
