/* ---------------- HELIX -------------------- */

export interface FollowsData {
	broadcaster_id: string;
	broadcaster_login: string;
	broadcaster_name: string;
	followed_at: string;
}

export interface FollowsResponse {
	data: Array<{
		broadcaster_id: string;
		broadcaster_login: string;
		broadcaster_name: string;
		followed_at: string;
	}>;
	pagination: {
		cursor: string; // base64-encoded object
	};
	total: number;
}

export interface UserSubscriptions {
	broadcaster_id: string;
	broadcaster_login: string;
	broadcaster_name: string;
	gifter_id?: string;
	gifter_login?: string;
	is_gift: boolean;
	tier: SubscriptionTier;
}

enum SubscriptionTier {
	'TIER1' = 1000,
	'TIER2' = 2000,
	'TIER3' = 3000,
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

/* ----------------- GQL --------------------- */
interface Badges {
	id: string; // b64-enc
	setID: string;
	version: string;
	title: string;
	image1x: string; // url
	image2x: string; // url
	image4x: string; // url
	clickAction: string | null;
	clickURL: string | null;
	__typename: string;
}

// this lists channel details in both 'User' and 'Channel' types
interface RecapBase {
	id: string;
	displayName: string;
	profileImageURL?: string;
}

interface User extends RecapBase {
	broadcastBadges: Badges[];
	self: {
		recap: UserRecap;
		subscriptionBenefit: Benefit;
		subscriptionTenure: Tenure;
	};
}

interface UserRecap {
	chatMessagesSent: string;
	minutesWatched: string;
	streamsPlayed: string;
	__typename: string; // 'UserRecap'
}

interface Benefit {
	endsAt: string; // date
	gift: {
		gifter?: {
			displayName?: string;
			id?: string;
			login?: string;
			__typename?: string;
		} | null;
		isGift: boolean; // if false, no gifter field on gift object
		__typename: string;
	};
	id: string;
	interval: {
		unit: string;
		duration: number;
		__typename: string;
	};
	isDNRd: boolean; // 'do not renew'-ed
	isExtended: boolean;
	pendingSubscription: any | null; // idk
	platform: string;
	purchasedWithPrime: boolean;
	renewsAt: string | null; // assuming date when auto-renew enabled
	tier: string; // 1000/2000/3000 for each tier
	__typename: string;
}

interface Tenure {
	daysRemaining: number;
	months: number;
	__typename: string;
}

interface Channel extends RecapBase {
	recap: ChannelRecap;
	__typename: string; // 'Channel' or 'UserSelfConnection'
}

interface ChannelRecap {
	chatMessagesSent: string;
	emoteUsage: Array<{
		emote: {
			id: string;
			suffix: string;
			token: string;
			__typename: string;
		};
		totalUsage: string;
		__typename: string;
	}>;
	minutesStreams?: string;
	streamsStreamed?: string;
	__typename: string;
}

export interface RecapsQueryResponse {
	data: {
		badges: Badges[];
		channel: Channel;
		user: User;
	};

	extensions: {
		durationMilliseconds: number;
		operationName: string;
		requestID: string;
	};
}

export interface CacheData {
	id: string;
	data: {
		following: FollowsData[];
		subscriptions: UserSubscriptions[];
		recaps: RecapsQueryResponse[];
	};
}
