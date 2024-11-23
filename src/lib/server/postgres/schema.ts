import { relations } from 'drizzle-orm';
import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

/** users table */
export const users = table(
	'users',
	{
		id: t.varchar('id').primaryKey(),
		login: t.varchar('login').unique().notNull(),
		display_name: t.varchar('display_name').unique().notNull(),
		profile_image_url: t.varchar('profile_image_url').notNull(),
		description: t.varchar('description').notNull(),
		created_at: t.varchar('created_at').notNull(),
		color: t.varchar('color').default('#000000').notNull(),
		last_sync: t.timestamp('last_sync').defaultNow().notNull(),
	},
	(table) => [t.index('sync_users_index').on(table.last_sync)],
);

/** follows table */
export const follows = table(
	'follows',
	{
		user_id: t
			.varchar('user_id')
			.references(() => users.id)
			.notNull(),
		broadcaster_id: t
			.varchar('broadcaster_id')
			.references(() => users.id)
			.notNull(),
		followed_at: t.timestamp('followed_at').notNull(),
		last_sync: t.timestamp('last_sync').notNull(),
	},
	(table) => [
		t.primaryKey({ columns: [table.user_id, table.broadcaster_id] }),
		t.index('user_follows_index').on(table.user_id),
		t.index('broadcaster_followers_index').on(table.broadcaster_id),
		t.index('sync_follows_index').on(table.last_sync),
	],
);

/** subscriptions table */
export const subscriptions = table(
	'subscriptions',
	{
		user_id: t
			.varchar('user_id')
			.references(() => users.id)
			.notNull(),
		broadcaster_id: t
			.varchar('broadcaster_id')
			.references(() => users.id)
			.notNull(),
		tier: t.integer('tier').default(1).notNull(),
		is_gift: t.boolean('is_gift').default(false).notNull(),
		gifter_id: t.varchar('gifter_id').references(() => users.id),
		gifter_name: t
			.varchar('gifter_name')
			.references(() => users.display_name),
		benefit_expiry: t.varchar('benefit_exp'),
		tenure: t.integer('tenure_months'),
		remaining: t.integer('remaining_days'),
		last_sync: t.timestamp('last_sync').notNull(),
	},
	(table) => [
		t.primaryKey({ columns: [table.user_id, table.broadcaster_id] }),
		t.index('user_subscription_index').on(table.user_id),
		t.index('sync_subscription_index').on(table.last_sync),
	],
);

/** badges table */
export const badges = table(
	'badges',
	{
		broadcaster_id: t.varchar('broadcaster_id').references(() => users.id),
		badge_id: t.varchar('badge_id').notNull(),
		title: t.varchar('title').notNull(),
		url: t.varchar('url').notNull(),
		last_sync: t.timestamp('last_sync').defaultNow(),
	},
	(table) => [
		t.primaryKey({
			columns: [table.broadcaster_id, table.badge_id, table.title],
		}),
		t
			.uniqueIndex('badges_broadcaster_badge_index')
			.on(table.broadcaster_id, table.badge_id),
		t.index('sync_badges_index').on(table.last_sync),
	],
);

/** users table relations */
export const usersRelations = relations(users, ({ many }) => ({
	following: many(follows, {
		relationName: 'follower',
	}),
	subscriptions: many(subscriptions, {
		relationName: 'subscriber',
	}),
}));

/** follows table relations */
export const followsRelations = relations(follows, ({ one }) => ({
	broadcaster: one(users, {
		relationName: 'followed',
		fields: [follows.broadcaster_id],
		references: [users.id],
	}),

	user: one(users, {
		relationName: 'follower',
		fields: [follows.user_id],
		references: [users.id],
	}),

	subscription: one(subscriptions, {
		fields: [follows.broadcaster_id, follows.user_id],
		references: [subscriptions.broadcaster_id, subscriptions.user_id],
	}),

	badge: one(badges, {
		fields: [follows.broadcaster_id],
		references: [badges.broadcaster_id],
	}),
}));

/** subscriptions table relations */
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	broadcaster: one(users, {
		relationName: 'subscription',
		fields: [subscriptions.broadcaster_id],
		references: [users.id],
	}),

	user: one(users, {
		relationName: 'subscriber',
		fields: [subscriptions.user_id],
		references: [users.id],
	}),
}));

/** badges table relations */
export const badgesRelations = relations(badges, ({ one }) => ({
	broadcaster: one(users, {
		fields: [badges.broadcaster_id],
		references: [users.id],
	}),
}));
