import type { FollowInsert, FollowSelect, UserInsert } from '$types';
import { and, eq, gt } from 'drizzle-orm';
import { db } from './db';
import { follows, users } from './schema';

/** three days */
const RESYNC_THRESHOLD = 1000 * 60 * 60 * 24 * 3;

export const pg = {
    insert: {
        user: async (data: UserInsert) => {
            await db.insert(users)
                .values(data)
                .onConflictDoUpdate({
                    target: users.id,
                    set: {
                        login: data.login,
                        display_name: data.display_name,
                        profile_image_url: data.profile_image_url,
                        description: data.description,
                        color: data.color,
                        last_sync: new Date(),
                    },
                });
        },

        follows: async (data: FollowInsert) => {
            db.insert(follows).values(data).onConflictDoNothing();
        },
    },

    select: {
        user: async (userId: string) => {
            return await db.query.users
                .findFirst({
                    where: and(
                        eq(users.id, userId),
                        gt(
                            users.last_sync,
                            new Date(Date.now() - RESYNC_THRESHOLD),
                        ),
                    ),
                }).execute();
        },

        follows: async (userId: string) => {
            return await db.query.follows
                .findMany({
                    where: eq(follows.user_id, userId),
                    with: {
                        broadcaster: true,
                    },
                }).execute();
        },
    },
};
