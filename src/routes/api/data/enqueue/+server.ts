import { processors } from '$server/bull/processors';
import { fetchQueue } from '$server/bull/queue/queue';
import { json, type RequestEvent } from '@sveltejs/kit';
import { notifyClients } from '../status/[user_id]/utils';
import type { JobProgress } from '$types/queue/types';
import { connection as redis } from '$server/redis/redis';

export const POST = async (event: RequestEvent) => {
    const { user, tokens } = event.locals;
    if (!user || !tokens) {
        return json(
            { error: true, message: 'no local user/token in request' },
            { status: 400 },
        );
    }

    const jobs = await Promise.all(
        Object.keys(processors).map((processor) => {
            return fetchQueue.add(`fetch:${processor}`, {
                processor: processor as keyof typeof processors,
                userId: user.id,
                access: tokens.access,
            });
        }),
    );

    Object.keys(processors).forEach(async (p) => {
        const data = await redis.get(`progress:${p}:${user.id}`);
        if (data) {
            notifyClients(JSON.parse(data));
        }
    });

    return json(
        { error: false, jobIds: jobs.map((job) => job.id) },
        { status: 200 },
    );
};
