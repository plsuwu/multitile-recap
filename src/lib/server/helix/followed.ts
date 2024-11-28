import { APIError, RateLimitError } from '$server/errors';
import type { HelixFollowedData, HelixFollowedDataObject } from '$types/helix/api-response-types';
import { followedUri } from './utils';

export async function fetchFollowed(
	userId: string,
	headers: Headers,
): Promise<HelixFollowedDataObject[]> {
	/** inner fetch function to fetch the next page */
	const fetchNext = async (
		userId: string,
		cursor?: string,
	): Promise<HelixFollowedData> => {
		const uri = followedUri(userId, cursor);
		const followed = await fetch(uri, {
			method: 'GET',
			headers: headers,
		});

		if (!followed.ok) {
			if (followed.status === 429) {
				const retryAfter =
					followed.headers.get('Ratelimit-Reset') || undefined;
				throw new RateLimitError('RATE_LIMIT_EXCEEDED', retryAfter);
			}

			throw new APIError('HELIX_ERROR', followed.status);
		}

		return await followed.json();
	};

	/** main fn logic */
	let following: HelixFollowedData;
	try {
		following = await fetchNext(userId);

		while (
			following.pagination.cursor &&
			following.data &&
			following.total > following.data.length
		) {
			const next = await fetchNext(userId, following.pagination.cursor);
			following.data.push(...next.data);
			following.pagination = next.pagination;
		}
	} catch (err) {
		throw err;
	}

	return following.data;
}
