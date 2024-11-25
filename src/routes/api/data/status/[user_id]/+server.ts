import type { RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import redis from "$server/redis";

export const GET = async (event: RequestEvent) => {
    const { user } =  event.locals;
    if (!user) {
        return json({
            error: true,
            message: 'must be logged in to check fetch job process',
        }, { status: 401 });
    }

    const progress = await redis.redis.get(`_followed_job_progress:${user.id}`);
    console.log(progress);

    return json(progress ? JSON.parse(progress) : null);
}
