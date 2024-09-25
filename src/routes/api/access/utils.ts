import { TWITCH_CLIENT_ID } from '$env/static/private';
import { TWITCH_GQL_ENDPOINT } from '@api/generate/utils';
import { buildAuthorizedHeader } from '@server/utility';

export const tokenIsValid = async (
	token: string,
	twitch_id: string
): Promise<{ error: boolean, message: string, details?: unknown }> => {
    let  result = { error: false, message: '', details: undefined as unknown };
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

	const headers = buildAuthorizedHeader(token, true, TWITCH_CLIENT_ID, [
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
            result.error = true;
            result.message = 'Response ID does not match';
			return result;
		}

        return result;
	} catch (err) {
		console.error('[!] Error while validating GQL token:', err);
        result.error = true;
        result.message = `Unhandled error during validation: ${err} (see 'details' field)`;
        result.details = err;
		return result;
	}
};

export async function tokenIsSanitary(input: string) {
	if (!input || input.length !== 30) {
		return false;
	}

	const nonAscii = input.toLowerCase().match(/[^a-z0-9]/gi);
	if (nonAscii) {
		return false;
	}

	return true;
}
