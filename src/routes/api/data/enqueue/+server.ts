import { json } from '@sveltejs/kit';
import { fetchQueue as fQueue } from '$redis/queue/followed';
import { fetchQueue as sQueue } from '$redis/queue/subscribed';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { log } from '$logging';
import { subscriptions } from '$server/postgres/schema';

export const POST = async (event: RequestEvent) => {
    const { user, tokens } = event.locals;
    log.debug(`[/api/data/enqueue][JOB QUEUE]: user.id: ${user?.id}`);
    log.debug(`[/api/data/enqueue][JOB QUEUE]: user.id: ${tokens?.access}`);

    const userId = user?.id;
    const access = tokens?.access;

    console.log('UID +  ACC:', userId, access);

    const { followEndpoints, subscribeEndpoints } = await event.request.json();
    console.log('endpoints=>', followEndpoints, subscribeEndpoints);

    const follow = await fQueue.add('fetch', {
        userId,
        access,
        endpoints: [followEndpoints],
    });

    const subscribe = await sQueue.add('fetch', {
        userId,
        access,
        endpoints: [subscribeEndpoints],
    });

    return json({ followId: follow.id, subscribeId: subscribe.id });
};
