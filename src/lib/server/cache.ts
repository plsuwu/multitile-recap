import { createClient, type RedisClientType } from 'redis';
import { RedisAdapter } from './redis';

const REDIS_URL = 'redis://localhost:6379';

export const luciaClient = await createClient({ url: REDIS_URL }).connect();
export const adapter = new RedisAdapter({ client: luciaClient });

export interface CacheConfig {
	url?: string;
	ttl?: number; // TTL in seconds
}

class RedisCacheWorker {
	private client: RedisClientType;
	private ttl: number;

	constructor(config: CacheConfig) {
		this.client = createClient({
			url: config.url ?? REDIS_URL,
		});

		this.ttl = config.ttl || 3600; // default: 1 hour
		this.client.connect();
	}

	private getUserKey(id: string | number): string {
		return `user:${id}`;
	}

	private getDataKey(id: string | number): string {
		return `data:${id}`;
	}

    private getAuthKey(id: string | number): string {
        return `auth:${id}`;
    }

	async readUser<T>(id: string | number): Promise<T | null> {
		const key = this.getUserKey(id);
		const user = await this.client.hGetAll(key);
		if (typeof user.data === typeof Object.create(null).data) {
			return null;
		}

		return JSON.parse(user.data) as T;
	}

	async readData<T>(id: string): Promise<T | null> {
		const key = this.getDataKey(id);
		const data = await this.client.hGetAll(key);
		if (typeof data.data === typeof Object.create(null).data) {
			return null;
		}

		return JSON.parse(data.data) as T;
	}

    async readTempAuth(id: string): Promise<string | null> {
        const key = this.getAuthKey(id);
        const auth = await this.client.get(key);
        if (!auth || typeof auth !== typeof '') {
            return null;
        }

        return auth;
    }

    async writeTempAuth(id: string, auth: string): Promise<void> {
        const key = this.getAuthKey(id);
        await this.client.set(key, auth, {
            EX: this.ttl,
        });
    }

	async writeUser<T>(id: string | number, data: T): Promise<void> {
		const key = this.getUserKey(id);
		await this.client.hSet(key, {
			data: JSON.stringify(data),
		});
	}

	async writeData<T>(id: string | number, data: T): Promise<void> {
		const key = this.getDataKey(id);
		await this.client.hSet(key, {
			data: JSON.stringify(data),
		});
	}

	async exists(id: string | number): Promise<boolean> {
		const key = this.getUserKey(id);
		return (await this.client.exists(key)) === 1;
	}

	async delete(id: string | number): Promise<void> {
		const key = this.getUserKey(id);
		await this.client.del(key);
	}

    async deleteAuth(id: string | number) {
        const key = this.getAuthKey(id);
        await this.client.del(key);
    }

	async close(): Promise<void> {
		await this.client.quit();
	}
}

export default RedisCacheWorker;
