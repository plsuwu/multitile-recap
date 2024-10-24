import type { CachedUser } from '$lib/types';
import type { RequestEvent } from './$types';
import RedisCacheWorker, { KeyType } from '$lib/server/cache';
import { json } from '@sveltejs/kit';
import { twitch } from '$lib/server/auth';

export const GET = async (event: RequestEvent): Promise<Response> => {
	const luciaId = event.locals.user?.id;
	const refreshToken = event.locals.user?.tokens.refresh;
	const expiry = event.locals.user?.tokens.expiry;

	if (!luciaId || !refreshToken || !expiry) {
		return json(
			{
				error: true,
				message: 'Missing one or more credential fields'
			},
			{ status: 400 }
		);
	}

	if (Number(expiry) > Date.now()) {
		return json(
			{
				error: true,
				message:
					`Token should still be valid: \n` +
					`Token expires: ${new Date(expiry).toISOString()},\n` +
					`Current time: ${new Date(Date.now()).toISOString()}`
			},
			{ status: 200 }
		);
	}
	try {
		const refreshed = await twitch.refreshAccessToken(refreshToken);
		const updated = {
			id: luciaId,
			ttv_user: {
				...event.locals.user?.ttv_user
			},
			tokens: {
				access: refreshed.accessToken(),
				refresh: refreshed.refreshToken(),
				expiry: Date.parse(refreshed.accessTokenExpiresAt().toString())
			}
		};

		const worker = new RedisCacheWorker({});
		await worker.delete(luciaId, KeyType.Data);

        // we could handle a TypeError if this throws when trying to write;
        // TODO: ignore for now but come back once working
		await worker.writeData<CachedUser>(luciaId, KeyType.Data, updated);
		worker.close();

		return json(
			{
				error: false,
				message: null
			},
			{ status: 200 }
		);
	} catch (err) {

		console.error(err);
		return json(
			{
				error: true,
				message: 'Unhandled error - refer to console output'
			},
			{ status: 500 }
		);
	}
};
