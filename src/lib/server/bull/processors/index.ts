import { db } from "$server/postgres/db";
import { connection as redis } from "$redis/redis";
import { FollowedProcessor } from "./followed";
import { SubscriptionProcessor } from "./subscription";


export const processors = {
    followed: new FollowedProcessor(db, redis),
    subscription: new SubscriptionProcessor(db, redis),
    // + subscription,
    // + badges,
    // ...
} as const;
export type ProcessorName = keyof typeof processors;
