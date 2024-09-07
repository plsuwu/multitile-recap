import { TWITCH_CLIENT_ID } from '$env/static/private';
import type { SubscriptionsResponse, SubscriptionsResponseError } from './types';
import type { RequestEvent } from '@sveltejs/kit';
import { follows, subscriptions } from './utility';
import { cacheTTVData, getCachedTTVData } from '$lib/server/auth';
import { redirectErrorConstructor } from '@/lib/server/error_constructor';

export async function GET(event: RequestEvent): Promise<Response> {
	const access = event.locals.user?.access;
	const sessionId = event.locals.session?.id;
	const twitchUserId = event.locals.user?.twitch_id;
    const userId = event.locals.user?.id;

	if (!access || !sessionId || !twitchUserId || !userId) {
		console.error(
			`[!] Missing required session information:`,
			`\n     >> access token:    ${access ? 'ok' : 'missing'}`,
			`\n     >> session:         ${sessionId ? 'ok' : 'missing'}`,
			`\n     >> twitch_user:     ${twitchUserId ? 'ok' : 'missing'}`,
			`\n     >> site_user:       ${userId ? 'ok' : 'missing'}`
		);

        redirectErrorConstructor(0, event);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const cachedSubs = getCachedTTVData(userId);

	if (!cachedSubs) {
		const headers = new Headers({
			Authorization: `Bearer ${access}`,
			'Client-Id': TWITCH_CLIENT_ID
		});

		let following = await follows(`?user_id=${twitchUserId}&first=100`, headers);
		let subs = new Array();

		subs = await Promise.all(
			following.data.map(async (broadcaster) => {
				const broadcasterId = broadcaster.broadcaster_id;

				const params = `?broadcaster_id=${broadcasterId}&user_id=${twitchUserId}`;
				const subscribed = await subscriptions(params, headers);

				if (!(subscribed as SubscriptionsResponseError).status) {

                    // unpack to flatten the broadcaster array so we dont have each broadcaster
                    // as a second array dimension lmao
                    const [sub] = (subscribed as SubscriptionsResponse).data;
                    return sub;
				}
			})
		);

        subs = subs.filter(Boolean);
        cacheTTVData(userId, twitchUserId, subs, following.data);
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/generator'
		}
	});
}
