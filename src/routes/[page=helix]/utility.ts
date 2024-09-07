import { db } from '$lib/server/auth';
import type {
	SubscriptionsResponse,
	FollowsResponse,
	SubscriptionsResponseError
} from './types';

const HELIX_FOLLOWS = 'https://api.twitch.tv/helix/channels/followed';
const HELIX_SUBSCRIPTIONS = 'https://api.twitch.tv/helix/subscriptions/user';

export const follows = async (
	params: string,
	headers: Headers
): Promise<FollowsResponse> => {
	const uri = `${HELIX_FOLLOWS}/${params}`;
	const res = await fetch(uri, {
		headers: headers
	});

	const body: FollowsResponse = await res.json();

	if (body.pagination.cursor && body.data && body.data.length < body.total) {
		const newParams = `${params.split('&after')[0]}&after=${body.pagination.cursor}`;
		const nextBody = await follows(`${newParams}`, headers);

		const merged: FollowsResponse = {
			data: [...body.data, ...nextBody.data],
			total: body.total,
			pagination: body.pagination
		};

		return merged;
	}

	return body;
};

export const subscriptions = async (
	params: string,
	headers: Headers
): Promise<SubscriptionsResponse | SubscriptionsResponseError> => {
	const uri = `${HELIX_SUBSCRIPTIONS}/${params}`;
	const res = await fetch(uri, {
		headers: headers
	});

	const body: SubscriptionsResponse = await res.json();

	return body;
};
