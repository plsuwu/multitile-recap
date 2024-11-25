import {
    REDIS_CONTAINER_HOST,
    REDIS_CONTAINER_PORT,
} from '$env/static/private';
import { log } from '$logging';
import { Redis } from 'ioredis';
import { Queue, QueueEvents, Worker } from 'bullmq';
import type { SessionData, TwitchTokens, TwitchUser } from '$types';
import { authorizedHeadersFrom, HELIX } from '$server/helix/utils';
import { SyncHelper } from '$server/bull/job-helpers';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    ttl?: number;
}

const REDIS_URL = process.env.PRODUCTION ? REDIS_CONTAINER_HOST : 'localhost';
const REDIS_PORT = process.env.PRODUCTION ? Number(REDIS_CONTAINER_PORT) : 6379;

const connection = new Redis({
    host: REDIS_URL,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
});

export const fetchQueue = new Queue('fetch_followed', {
    connection,
});

export const queueEvents = new QueueEvents('fetch_followed', { connection });

export const fetchWorker = new Worker('fetch_followed', async (job) => {
    const { userId, access } = job.data;

    const sync = new SyncHelper(access);

    let total: number;
    let complete = 0;
    let prev: { display_name: string, color: string };

    try {
        total = await sync.getFollowedLength(userId)
    } catch (err) {
        console.error(err);
        throw err;
    }

    updateProgress(userId, {
        complete,
        total,
        status: 'processing',
        message: `beginning initial followed lookup`,
    });

    try {
        await sync.getFollowed(userId, (br => {
            complete = complete + 1;
            // console.log(br, complete);
            updateProgress(userId, {
                complete,
                total,
                status: 'running',
                message: `${br.display_name}`,
                color: `${br.color || '#000000'}`,
            });

            prev.display_name = br.display_name;
            prev.color = br.color || '#000000';
        }))
    } catch (err) {
        throw err;
    }

    updateProgress(userId, {
        complete: total,
        total,
        status: 'completed',
        message: `${prev!.display_name}`,
        color: `${prev!.color}`,
    });

},
{
    connection,
    removeOnComplete: { count: 1 },
    removeOnFail: { count: 10 },
}
);

async function updateProgress(userId: string, progression: any) {
    await connection.set(
        `_followed_job_progress:${userId}`,
        JSON.stringify(progression),
        'EX',
        3600,
    );
}

fetchWorker.on('failed', async (job, error) => {
    console.error(`queued job ${job?.id} failed:`, error);
    if (job?.data.userId) {
        await updateProgress(job.data.userId, {
            complete: 0,
            total: job.data.endpoints.length,
            status: 'failed',
            message: error.message,
        });
    }
});

fetchWorker.on('completed', async (job) => {
    await job.remove();
});
