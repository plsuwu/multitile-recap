import type {
    HelixUserData,
    HelixFollowedData,
    HelixColorData,
} from '$types/helix/api-response-types';
import { log } from '$logging';
import { authorizedHeadersFrom, HELIX } from '$server/helix/utils';
import { pg } from '$server/postgres/postgres';
import { RateLimitError } from 'bullmq';
import { pullFollowedFromHelix } from '$server/helix/followed';
import type { UserInsert } from '$types';

export class SyncHelper {
    private headers;

    constructor(token: string) {
        this.headers = authorizedHeadersFrom(token);
    }

    private async fetchData<T>(
        endpoint: string,
        errContext: string,
    ): Promise<T | null> {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: this.headers,
            });

            if (!response.ok) {
                if (response.status === 429) {
                    // idk throw the RateLimitError or something
                    console.error(
                        `SyncHelper.fetchData() rate limited (res.status '429'):`,
                        response.statusText,
                    );
                }

                if (response.status === 404) {
                    // this should only happen if we query HELIX.SUBSCRIPTION and the
                    // user is not subscribed
                    return null;
                }

                throw new Error(
                    `Unable to handle response code ${response.status} -> ${errContext}`,
                );
            }

            return (await response.json()) as T;
        } catch (err) {
            console.error('SyncHelper.fetchData() error during fetch:', err);
            throw err;
        }
    }

    private async dbOperation<T>(
        op: string,
        callback: () => Promise<T>,
    ): Promise<T> {
        try {
            return await callback();
        } catch (err) {
            throw new Error(
                `Unhandled error during SyncHelper.dbOperation(${op}):`,
                err as Error,
            );
        }
    }

    async storedUser(userId: string) {
        const storedUser = await this.dbOperation(
            'QUERY_STORED_USER',
            async () => await pg.select.user(userId),
        );

        console.log(storedUser);
        if (!storedUser) {
            return null;
        }

        return storedUser;
    }

    async getUser(userId: string) {
        let cache;
        try {
            cache = await this.storedUser(userId);
            console.log('CACHE DATA: ', cache);
            if (cache) return cache;

            const userBody = await this.fetchData<HelixUserData>(
                `${HELIX.USER}?id=${userId}`,
                'HELIX_FETCH_USER',
            );
            if (userBody === null || !userBody.data.length) {
                throw new Error(
                    `HELIX_FETCH_USER error: id: ${userId}, endpoint: ${HELIX.USER}?id=${userId}`,
                );
            }

            const colorBody = await this.fetchData<HelixColorData>(
                `${HELIX.COLOR}?user_id=${userId}`,
                'HELIX_FETCH_COLOR',
            );
            if (colorBody === null || !colorBody.data.length) {
                throw new Error(
                    `HELIX_FETCH_COLOR error: id: ${userId}, endpoint: ${HELIX.COLOR}?user_id=${userId}`,
                );
            }

            const user = userBody.data[0];
            const color = colorBody.data[0];
            const result: UserInsert = {
                id: user.id,
                login: user.login,
                display_name: user.display_name,
                profile_image_url: user.profile_image_url,
                description: user.description,
                created_at: user.created_at,
                color: color.color,
                last_sync: new Date(),
            };

            console.log(result);

            await this.dbOperation('UPSERT_FOLLOWED_USER', async () =>
                await pg.insert.user(result),
            );

            return result;
        } catch (err) {
            throw err;
        }
    }

    async getFollowedLength(userId: string): Promise<number> {
        try {
            const followed = await this.fetchData<HelixFollowedData>(
                `${HELIX.FOLLOWED}?user_id=${userId}`,
                'HELIX_FOLLOWED_SINGLE',
            );

            if (followed === null) {
                return 0;
            }
            console.log('FOLLOWED TOTAL:', followed.total);
            return followed.total;
        } catch (err) {
            throw err;
        }
    }

    async getFollowed(userId: string, callback?: (br: UserInsert) => void) {
        let stored;
        let len: number;
        try {
            len = await this.getFollowedLength(userId);
            stored = await this.dbOperation('QUERY_STORED_FOLLOWS', async () =>
                await pg.select.follows(userId),
            );

            if (stored && stored.length === len) {
                log.info('SyncHelper.getFollowed() found valid data:');
                log.info(stored[0].broadcaster.display_name);

                return stored;
            }

            const updates = await pullFollowedFromHelix(userId, this.headers);
            const followed = await Promise.all(
                updates.map(async (ch) => {
                    const br = await this.getUser(ch.broadcaster_id);
                    if (callback) {
                        callback(br);
                    }
                    return br;
                }),
            );

            return followed;
        } catch (err) {
            throw err;
        }
    }
}
