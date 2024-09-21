import { TWITCH_CLIENT_ID } from '$env/static/private';
import { TWITCH_GQL_ENDPOINT } from '@api/generate/utils';
import { buildAuthorizedHeader } from '@server/utility';

export const tokenIsValid = async (
	token: string,
	twitch_id: string
): Promise<boolean> => {
	const op = [
		{
			operationName: 'CoreActionsCurrentUser',
			variables: {},
			extensions: {
				persistedQuery: {
					version: 1,
					sha256Hash:
						'6b5b63a013cf66a995d61f71a508ab5c8e4473350c5d4136f846ba65e8101e95',
				},
			},
		},
	];

	const headers = buildAuthorizedHeader(token, true, true, TWITCH_CLIENT_ID, [
		{ 'Content-Type': 'application/json' },
		{ accept: '*/*' },
		{ Host: 'gql.twitch.tv' },
	]);
	try {
		const res = await fetch(TWITCH_GQL_ENDPOINT, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(op),
		});

		const [body] = await res.json();
		if (body.data.currentUser.id !== twitch_id) {
			return false;
		}

		return true;
	} catch (err) {
		console.error('[!] Error while validating GQL token:', err);
		return false;
	}
};
