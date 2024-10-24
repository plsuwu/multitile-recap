import type {
    Adapter,
    DatabaseSession,
    DatabaseUser
    // RegisteredDatabaseUserAttributes
} from 'lucia';
import type { RedisClientType, RedisFunctions, RedisModules, RedisScripts } from 'redis';
import RedisCacheWorker, { KeyType } from '$lib/server/cache';
import type { CachedUser } from '$lib/types';

interface RedisAdapterOptions {
    client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    prefix?: string;
}

const KEY_TYPE = {
    user: 'user',
    session: 'id'
};

export class RedisAdapter implements Adapter {
    private instance: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    private prefix: string;

    constructor({ client, prefix = 'sessions' }: RedisAdapterOptions) {
        this.instance = client;
        this.prefix = prefix;
    }

    private asDatabaseSession(sessionString: string): DatabaseSession {
        const session = JSON.parse(sessionString);
        return {
            ...session,
            expiresAt: new Date(session.expiresAt)
        };
    }

    private sessionKey(id: string, type: string = 'id') {
        return `${this.prefix}:${type}:${id}`;
    }

    private msUntil(exp: Date) {
        return Math.max(1, exp.getTime() - Date.now());
    }

    async deleteSession(sessionId: string): Promise<void> {
        const sessionString = await this.instance.get(this.sessionKey(sessionId));
        if (!sessionString) {
            return;
        }

        const session = this.asDatabaseSession(sessionString);
        await this.instance
            .multi()
            .del(this.sessionKey(sessionId))
            .sRem(this.sessionKey(session.userId, KEY_TYPE.user), sessionId)
            .exec();
    }

    async deleteUserSessions(userId: string): Promise<void> {
        const sessionIds = await this.instance.sMembers(this.sessionKey(userId, KEY_TYPE.user));
        const transaction = this.instance.multi();
        for (const sessionId of sessionIds) {
            transaction.del(this.sessionKey(sessionId));
        }

        transaction.del(this.sessionKey(userId, KEY_TYPE.user));
        await transaction.exec();
    }

    async getSessionAndUser(
        sessionId: string
    ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
        const worker = new RedisCacheWorker({});

        console.log(`[*] Searching for key '${this.prefix}:${sessionId}:<id>'`);
        const sessionString = await this.instance.get(this.sessionKey(sessionId));

        if (!sessionString) {
            return [null, null];
        }

        console.log(sessionString);

        const session = this.asDatabaseSession(sessionString);
        const data: CachedUser | null = await worker.readData<CachedUser>(session.userId, KeyType.Data);

        if (!data) {
            return [null, null];
        }
        const user: DatabaseUser = {
            id: session.id,
            attributes: { ...data },
        };

        worker.close();
        return [session, user];
    }

    async getUserSessions(userId: string): Promise<DatabaseSession[]> {
        const sessionIds = await this.instance.sMembers(this.sessionKey(userId, KEY_TYPE.user));

        const sessions = await Promise.all(
            sessionIds.map(async (sessionId) => {
                const sessionString = await this.instance.get(this.sessionKey(sessionId));
                if (!sessionString) {
                    await this.instance.sRem(this.sessionKey(userId, KEY_TYPE.user), sessionId);
                    return undefined;
                }

                return this.asDatabaseSession(sessionString);
            })
        );

        return sessions.filter((session): session is DatabaseSession => Boolean(session));
    }

    async setSession(session: DatabaseSession): Promise<void> {
        console.log(`[+] would do SET ${session.id}:${JSON.stringify(session)}`);
        console.log(`[+] would do sAdd user:${session.userId}:${session.id}`);
        await this.instance
            .multi()
            .set(this.sessionKey(session.id), JSON.stringify(session), {
                PX: this.msUntil(session.expiresAt)
            })
            .sAdd(this.sessionKey(session.userId, KEY_TYPE.user), session.id)
            .exec();
    }

    async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        const sessionString = await this.instance.get(this.sessionKey(sessionId));
        if (!sessionString) {
            return;
        }

        const session = this.asDatabaseSession(sessionString);
        session.expiresAt = expiresAt;
        console.log(sessionId, session);
        await this.instance.set(this.sessionKey(sessionId), JSON.stringify(session), {
            PX: this.msUntil(expiresAt)
        });
    }

    public async deleteExpiredSessions(): Promise<void> { }
}

// export class RedisAdapter implements Adapter {
// 	private redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
// 	private prefix: string;
//
// 	constructor({ client, prefix = 'sessions' }: RedisAdapterOptions) {
// 		this.redis = client;
// 		this.prefix = prefix;
// 	}
//
// 	async deleteSession(sessionId: string): Promise<void> {
// 		const sessionString = await this.redis.get(this.sessionKey(sessionId));
// 		if (!sessionString) return;
// 		const session = this.transformIntoDatabaseSession(sessionString);
// 		await this.redis
// 			.multi()
// 			.del(this.sessionKey(sessionId))
// 			.sRem(this.userSessionsKey(session.userId), sessionId)
// 			.exec();
// 	}
//
// 	async deleteUserSessions(userId: string): Promise<void> {
// 		const sessionIds = await this.redis.sMembers(
// 			this.userSessionsKey(userId)
// 		);
// 		const transaction = this.redis.multi();
// 		for (const sessionId of sessionIds) {
// 			transaction.del(this.sessionKey(sessionId));
// 		}
// 		transaction.del(this.userSessionsKey(userId));
// 		await transaction.exec();
// 	}
//
// 	async getSessionAndUser(
// 		sessionId: string
// 	): Promise<[DatabaseSession | null, DatabaseUser | null]> {
// 		const worker = new RedisCacheWorker({});
// 		const sessionString = await this.redis.get(this.sessionKey(sessionId));
// 		if (!sessionString) return [null, null];
// 		const session = this.transformIntoDatabaseSession(sessionString);
//
// 		const data: CachedUserAttributes | null =
// 			await worker.readUser<CachedUserAttributes>(session.userId);
// 		if (!data) return [null, null];
//
// 		// attributes are defined and implemented OUTSIDE of this adapter
// 		// we will just ignore the linter TypeError because its not real
// 		const user: DatabaseUser = {
// 			id: session.userId,
// 			attributes: { ...data },
// 		};
// 		worker.close();
//
// 		return [session, user];
// 	}
//
// 	async getUserSessions(userId: string): Promise<DatabaseSession[]> {
// 		const sessionIds = await this.redis.sMembers(
// 			this.userSessionsKey(userId)
// 		);
// 		const sessions = await Promise.all(
// 			sessionIds.map(async (sessionId) => {
// 				const sessionString = await this.redis.get(
// 					this.sessionKey(sessionId)
// 				);
// 				if (!sessionString) {
// 					await this.redis.sRem(
// 						this.userSessionsKey(userId),
// 						sessionId
// 					);
// 					return undefined;
// 				}
// 				return this.transformIntoDatabaseSession(sessionString);
// 			})
// 		);
// 		return sessions.filter((session): session is DatabaseSession =>
// 			Boolean(session)
// 		);
// 	}
//
// 	async setSession(session: DatabaseSession): Promise<void> {
// 		await this.redis
// 			.multi()
// 			.set(this.sessionKey(session.id), JSON.stringify(session), {
// 				PX: this.getMillisecondsUntil(session.expiresAt),
// 			})
// 			.sAdd(this.userSessionsKey(session.userId), session.id)
// 			.exec();
// 	}
//
// 	async updateSessionExpiration(
// 		sessionId: string,
// 		expiresAt: Date
// 	): Promise<void> {
// 		const sessionString = await this.redis.get(this.sessionKey(sessionId));
// 		if (!sessionString) return;
// 		const session = this.transformIntoDatabaseSession(sessionString);
// 		session.expiresAt = expiresAt;
// 		await this.redis.set(
// 			this.sessionKey(sessionId),
// 			JSON.stringify(session),
// 			{
// 				PX: this.getMillisecondsUntil(expiresAt),
// 			}
// 		);
// 	}
//
// 	public async deleteExpiredSessions(): Promise<void> {}
//
// 	private getMillisecondsUntil(expiresAt: Date) {
// 		return Math.max(1, expiresAt.getTime() - Date.now());
// 	}
//
// 	private sessionKey(sessionId: string) {
// 		return `${this.prefix}:id:${sessionId}`;
// 	}
//
// 	private userSessionsKey(userId: string) {
// 		return `${this.prefix}:user:${userId}`;
// 	}
//
// 	private transformIntoDatabaseSession(
// 		sessionString: string
// 	): DatabaseSession {
// 		const session = JSON.parse(sessionString);
// 		return {
// 			...session,
// 			expiresAt: new Date(session.expiresAt),
// 		};
// 	}
// }
