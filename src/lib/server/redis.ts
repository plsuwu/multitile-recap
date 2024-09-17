import type {
	Adapter,
	DatabaseSession,
	DatabaseUser,
	RegisteredDatabaseUserAttributes,
} from 'lucia';
import type {
	RedisClientType,
	RedisFunctions,
	RedisModules,
	RedisScripts,
} from 'redis';
import RedisCacheWorker from './cache';

interface RedisAdapterOptions {
	client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
	prefix?: string;
}

interface CachedUserAttributes {
	id: string;
	twitch_id: string;
	login: string;
	display_name: string;
	profile_image_url: string;
	access: string;
	refresh: string;
	refresh_after: string;
}

export class RedisAdapter implements Adapter {
	private redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
	private prefix: string;

	constructor({ client, prefix = 'sessions' }: RedisAdapterOptions) {
		this.redis = client;
		this.prefix = prefix;
	}

	async deleteSession(sessionId: string): Promise<void> {
		const sessionString = await this.redis.get(this.sessionKey(sessionId));
		if (!sessionString) return;
		const session = this.transformIntoDatabaseSession(sessionString);
		await this.redis
			.multi()
			.del(this.sessionKey(sessionId))
			.sRem(this.userSessionsKey(session.userId), sessionId)
			.exec();
	}

	async deleteUserSessions(userId: string): Promise<void> {
		const sessionIds = await this.redis.sMembers(
			this.userSessionsKey(userId)
		);
		const transaction = this.redis.multi();
		for (const sessionId of sessionIds) {
			transaction.del(this.sessionKey(sessionId));
		}
		transaction.del(this.userSessionsKey(userId));
		await transaction.exec();
	}

	async getSessionAndUser(
		sessionId: string
	): Promise<[DatabaseSession | null, DatabaseUser | null]> {
		const worker = new RedisCacheWorker({});
		const sessionString = await this.redis.get(this.sessionKey(sessionId));
		if (!sessionString) return [null, null];
		const session = this.transformIntoDatabaseSession(sessionString);

		const data: CachedUserAttributes | null =
			await worker.readUser<CachedUserAttributes>(session.userId);
		if (!data) return [null, null];

		// attributes are defined and implemented OUTSIDE of this adapter
		// we will just ignore the linter TypeError because its not real
		const user: DatabaseUser = {
			id: session.userId,
			attributes: { ...data },
		};
		worker.close();

		return [session, user];
	}

	async getUserSessions(userId: string): Promise<DatabaseSession[]> {
		const sessionIds = await this.redis.sMembers(
			this.userSessionsKey(userId)
		);
		const sessions = await Promise.all(
			sessionIds.map(async (sessionId) => {
				const sessionString = await this.redis.get(
					this.sessionKey(sessionId)
				);
				if (!sessionString) {
					await this.redis.sRem(
						this.userSessionsKey(userId),
						sessionId
					);
					return undefined;
				}
				return this.transformIntoDatabaseSession(sessionString);
			})
		);
		return sessions.filter((session): session is DatabaseSession =>
			Boolean(session)
		);
	}

	async setSession(session: DatabaseSession): Promise<void> {
		await this.redis
			.multi()
			.set(this.sessionKey(session.id), JSON.stringify(session), {
				PX: this.getMillisecondsUntil(session.expiresAt),
			})
			.sAdd(this.userSessionsKey(session.userId), session.id)
			.exec();
	}

	async updateSessionExpiration(
		sessionId: string,
		expiresAt: Date
	): Promise<void> {
		const sessionString = await this.redis.get(this.sessionKey(sessionId));
		if (!sessionString) return;
		const session = this.transformIntoDatabaseSession(sessionString);
		session.expiresAt = expiresAt;
		await this.redis.set(
			this.sessionKey(sessionId),
			JSON.stringify(session),
			{
				PX: this.getMillisecondsUntil(expiresAt),
			}
		);
	}

	public async deleteExpiredSessions(): Promise<void> {}

	private getMillisecondsUntil(expiresAt: Date) {
		return Math.max(1, expiresAt.getTime() - Date.now());
	}

	private sessionKey(sessionId: string) {
		return `${this.prefix}:id:${sessionId}`;
	}

	private userSessionsKey(userId: string) {
		return `${this.prefix}:user:${userId}`;
	}

	private transformIntoDatabaseSession(
		sessionString: string
	): DatabaseSession {
		const session = JSON.parse(sessionString);
		return {
			...session,
			expiresAt: new Date(session.expiresAt),
		};
	}
}
