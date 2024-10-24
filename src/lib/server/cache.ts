import { REDIS_CONTAINER } from '$env/static/private';
import { createClient, type RedisClientType } from 'redis';
import { RedisAdapter } from '$lib/server/adapter';

const REDIS_URL = process.env.PRODUCTION ? REDIS_CONTAINER : 'redis://localhost:6379';

export const luciaClient = await createClient({ url: REDIS_URL }).connect();
export const adapter = new RedisAdapter({ client: luciaClient });

export interface CacheConfig {
    url?: string;
    ttl?: number; // ttl in secs
}

const test_data = {
    field_one: 'this is field one content',
    field_two: 'this is field two content'
};

export enum KeyType {
    User,
    Ttv,
    Data,
    Auth,
    Session,
}

class RedisCacheWorker {
    private client: RedisClientType;
    private ttl: number;

    constructor(config: CacheConfig) {
        this.client = createClient({
            url: config.url ?? REDIS_URL
        });

        this.ttl = config.ttl || 3600; // 1 hour default
        this.client.connect();
    }

    private getKey(keyType: KeyType, id: string): string {
        switch (keyType) {
            case KeyType.User:
                return `user:${id}`;
            case KeyType.Ttv:
                return `ttv:${id}`;
            case KeyType.Data:
                return `data:${id}`;

            // assume `KeyType.Auth` as default under the assumption that
            // it will be easier to integrate with Lucia
            default:
                return `auth:${id}`;
        }
    }

    async readData<T>(id: string, keyType: KeyType): Promise<T | null> {
        const key = this.getKey(keyType, id);
        let data;
        if (keyType === KeyType.Ttv) {
            console.log('TTV KEYTYPE');
            data = await this.client.get(key);
        } else {
            data = await this.client.hGetAll(key);
        }


        console.log('[*] READING DATA: ', data, `(WITH KEY ${key} | ID ${id})`);

        if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
            return null;
        }
        return data as T;
    }

    // async readGlobalToken(id: string): Promise<string | null> {
    //     const key = this.getKey(KeyType.Auth, id);
    //     const auth = await this.client.get(key);
    //     console.log(auth);
    //
    //     if (!auth) {
    //         return null;
    //     }
    //
    //     return auth;
    // }
    //
    // [+] Objects: k => id v => h3sejup7ap5oisk3
    // [+] Writing id: 'h3sejup7ap5oisk3' to cache
    // [+] Object:
    //      key => ttv_user,
    //      value => {
    //          id: '103033809',
    //          login: 'username',
    //          display_name: 'user'
    //      }
    // [+] Writing ttv_user: '[object Object]' to cache

    // async writeGlobalToken(id: string, auth: string): Promise<void> {
    //     const key = this.getKey(KeyType.Auth, id);
    //     await this.client.set(key, auth, {
    //         EX: 120,
    //     });
    // }

    async writeData<T extends Record<string, any>>(
        id: string,
        type: KeyType,
        data: T
    ): Promise<void> {
        const key = this.getKey(type, id);
        console.log(key, type, id, data);
        await Promise.all(
            Object.entries(data).map(async ([k, v]) => {
                console.log(key, type, id, data, k, v);
                if (typeof v === 'object' && v !== null) {
                    await this.client.hSet(`${key}:${k}`, { ...v });
                } else {
                    console.log(`SET ${key}:${v}`);
                    await this.client.set(key, v);
                }
            })
        );
    }

    async exists(id: string): Promise<boolean> {
        const key = this.getKey(KeyType.User, id);
        return (await this.client.exists(key)) === 1;
    }

    async delete(id: string, keyType: KeyType): Promise<void> {
        const key = this.getKey(keyType, id);
        await this.client.del(key);
    }

    async close(): Promise<void> {
        await this.client.quit();
    }
}

export default RedisCacheWorker;
