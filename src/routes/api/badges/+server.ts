import { buildAuthorizedHeader } from "@server/utility";
import type { RequestEvent } from "./$types";

const HELIX_BADGES_URL = 'https://api.twitch.tv/helix/chat/badges';

export const GET = async (event: RequestEvent): Promise<any> => {
    const broadcaster = event.url.searchParams.get('bid');
    const userId = event.locals.user?.id;
    const token = event.locals.user?.access;

    if (!broadcaster || !userId || !token) {
        return new Response(
            JSON.stringify({
                error: true,
                message: 'missing broadcaster or user details/authentication'
            }), { status: 400, }
        );
    };

    const headers = buildAuthorizedHeader(token);
    const res = await fetch(`${HELIX_BADGES_URL}?broadcaster_id=${broadcaster}`, {
        method: 'GET',
        headers: headers,
    });

    // console.log(res);

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
    })
}
