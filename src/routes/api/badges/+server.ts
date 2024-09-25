import { buildAuthorizedHeader } from '@server/utility';
import type { RequestEvent } from './$types';

const HELIX_BADGES_URL = 'https://api.twitch.tv/helix/chat/badges';

// a little annoying to implement as we can't use the native global.fetch node
// function from a `+page.server.ts`...
export const GET = async (event: RequestEvent): Promise<any> => {
	const broadcaster = event.url.searchParams.get('bid');
	const userId = event.locals.user?.id;
	const token = event.locals.user?.access;

	if (!userId || !token) {
		return new Response(
			JSON.stringify({
				error: true,
				message: 'Invalid or missing credentials',
			}),
			{
                status: 400
            }
		);
	}

    if (!broadcaster) {
		return new Response(
			JSON.stringify({
				error: true,
				message: 'Missing broadcaster ID',
			}),
			{
                status: 404
            }
		);
    }

	const headers = buildAuthorizedHeader(token);
	const res = await fetch(
		`${HELIX_BADGES_URL}?broadcaster_id=${broadcaster}`,
		{
			method: 'GET',
			headers: headers,
		}
	);

	interface BadgesResponse {
		data: Array<{
			set_id: string;
			versions: any[];
		}>;
	}

	const body: BadgesResponse = await res.json();
	const [badges] = body.data
		.filter((badge) => badge.set_id === 'subscriber')
		.map((badge) => badge.versions[0].image_url_4x);

	return new Response(JSON.stringify(badges), {
		status: 200,
	});
};
