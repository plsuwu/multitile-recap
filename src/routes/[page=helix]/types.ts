import { SubscriptionTier } from "@/lib/utils";

export interface SubcriptionsQueryParams {
    broadcaster_id: string;
    user_id: string;
}

export interface SubscriptionsResponse {
    data: Array<{
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        gifter_id?: string;
        gifter_login?: string;
        is_gift: boolean;
        tier: SubscriptionTier;
    }>;
}

export interface SubscriptionsResponseError {
    error: string;
    status: number;
    message: string;
}

export interface FollowsQueryParams {
    user_id: string;
    broadcaster_id?: string;
    first?: number;
    after?: string;
}

export interface FollowsResponse {
    total: number;
    data: Array<{
        broadcaster_id: string;
        broadcaster_login: string;
        broadcaster_name: string;
        followed_at: string;
    }>;
    pagination: {
        cursor?: string;
    }
}




