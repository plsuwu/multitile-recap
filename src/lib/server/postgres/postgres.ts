import type { FollowInsert, FollowSelect, SubscriptionInsert, UserInsert } from '$types';
import { and, eq, gt } from 'drizzle-orm';
import { db } from './db';
import { follows, subscriptions, users } from './schema';

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
            await db.insert(follows).values(data).onConflictDoUpdate({
                target: [follows.user_id, follows.broadcaster_id],
                set: {
                    user_id: data.user_id,
                    broadcaster_id: data.broadcaster_id,
                    followed_at: data.followed_at,
                    last_sync: new Date(),
                }
            });
        },

        subscriptions: async (data: SubscriptionInsert) => {
            await db.insert(subscriptions).values(data).onConflictDoUpdate({
                target: [subscriptions.user_id, subscriptions.broadcaster_id],
                set: {
                    last_sync: new Date(),
                    tier: data.tier,
                    is_gift: data.is_gift,
                    gifter_id: data.gifter_id,
                    gifter_name: data.gifter_name,
                },
            });
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

        subscriptions: async (userId: string) => {
            return await db.query.subscriptions.findMany({
                where: eq(subscriptions.user_id, userId),
                with: {
                    broadcaster: true,
                },
            }).execute();
        },
    },
};
