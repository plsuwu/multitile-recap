import type { badges, follows, subscriptions, users } from '$pg/schema';

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export type FollowInsert = typeof follows.$inferInsert;
export type FollowSelect = typeof follows.$inferSelect;

export type SubscriptionInsert = typeof subscriptions.$inferInsert;
export type SubscriptionSelect = typeof subscriptions.$inferSelect;

export type BadgesInsert = typeof badges.$inferInsert;
export type BadgesSelect = typeof badges.$inferSelect;
