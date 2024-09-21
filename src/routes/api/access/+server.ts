import RedisCacheWorker from '@server/cache';
import type { RequestEvent } from '@sveltejs/kit';
import type { DatabaseUser } from 'lucia';
import { tokenIsValid } from './utils';

export const POST = async (event: RequestEvent): Promise<Response> => {
	const { token } = await event.request.json();
	const userId = event.locals.user?.id;
	const twitchId = event.locals.user?.twitch_id;

	if (!tokenIsSanitary(token) || !userId || !twitchId) {
		return new Response(null, {
			status: 400,
		});
	}

	const valid = await tokenIsValid(token, twitchId);
	if (!valid) {
		return new Response(null, {
			status: 400,
		});
	}

	const worker = new RedisCacheWorker({});
	const cached = await worker.readUser<DatabaseUser>(userId);
	if (!cached) {
		return new Response(null, {
			status: 400,
		});
	}

	worker.writeTempAuth(userId, token);
	worker.close();

	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

async function tokenIsSanitary(input: string) {
	if (!input || input.length !== 30) {
		return false;
	}

	const nonAscii = input.toLowerCase().match(/[^a-z0-9]/gi);
	if (nonAscii) {
		return false;
	}

	return true;
}
