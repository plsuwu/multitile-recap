import { Queue, Worker, QueueEvents } from 'bullmq';
import type { BaseJobData } from '$types/queue/types';
import { processors, type ProcessorName } from '../processors';
import { RateLimitError } from '$server/errors';
import { connection } from '$redis/redis';

interface ProcessorJob extends BaseJobData {
	processor: ProcessorName;
}

export const fetchQueue = new Queue<ProcessorJob>('dataFetch', {
	connection,
	defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        }
    },
});

export const queueEvents = new QueueEvents('dataFetch', { connection });
const worker = new Worker<ProcessorJob>(
    'dataFetch',
    async (job) => {
        console.log('[+] Assigning worker to job:', job.id);
        const { processor: processorName, ...data } = job.data;
        const processor = processors[processorName];

        if (!processor) {
            throw new Error(`Unknown processor type: ${processorName}`);
        }

        try {
            await processor.process(data);
        } catch (err) {
            if (err instanceof RateLimitError) {
                const delay = err.reset;
                await new Promise(resolve => setTimeout(resolve, delay));
                throw err; // bullmq will auto-retry (?)
            }

            throw err;
        }
    },
    {
        connection,
        concurrency: 5,
        removeOnComplete: { count: 5 },
        removeOnFail: { count: 25 },
    }
);

worker.on('failed', (job, error) => {
    console.error(`[!] QUEUE JOB '${job?.id}' FAILURE:`, error);
});

// worker.on('completed', async (job) => {
//     job.remove();
// });

