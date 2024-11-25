import { json } from '@sveltejs/kit';
import { fetchQueue } from '$redis/queue/followed';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { log } from '$logging';

export const POST = async (event: RequestEvent) => {
    // console.log(event);
    const { user, tokens } = event.locals;
    log.debug(`[/api/data/enqueue][JOB QUEUE]: user.id: ${user?.id}`);
    log.debug(`[/api/data/enqueue][JOB QUEUE]: user.id: ${tokens?.access}`);

    const userId = user?.id;
    const access = tokens?.access;

    console.log('UID +  ACC:', userId, access);

    const { endpoints } = await event.request.json();
    console.log('endpoints=>', endpoints);

    const job = await fetchQueue.add('fetch', {
        userId,
        access,
        endpoints: [endpoints],
    });

    return json({ jobId: job.id });
};
