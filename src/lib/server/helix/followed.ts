import type { FollowInsert } from '$types';
import type { HelixFollowedData } from '$types/helix/api-response-types';
import { authorizedHeadersFrom, followedUri, HELIX } from './utils';

export async function pullFollowedFromHelix(
    userId: string,
    headers: Headers,
): Promise<FollowInsert[]> {
    /** inner fetch function to call recursively (?) */
    const recurse = async (
        userId: string,
        cursor?: string,
    ): Promise<HelixFollowedData> => {
        const uri = followedUri(userId, cursor);
        const followed = await fetch(uri, {
            method: 'GET',
            headers: headers,
        });

        return await followed.json();
    };

    /** main fn logic */
    try {
        let following = await recurse(userId);
        while (
            following.pagination.cursor &&
            following.data &&
            following.total > following.data.length
        ) {
            const next = await recurse(userId, following.pagination.cursor);
            following.data.push(...next.data);
            following.pagination = next.pagination;
        }

        return following.data.map((ch) => ({
            user_id: userId,
            broadcaster_id: ch.broadcaster_id,
            followed_at: new Date(ch.followed_at),
            last_sync: new Date(),
        }));
    } catch (err) {
        console.error(
            'Error while pulling followed users data from helix (in fn `pullFollowedFromHelix()`):',
            err,
        );
        throw err;
    }
}
