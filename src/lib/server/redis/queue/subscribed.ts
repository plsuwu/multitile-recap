import {
	REDIS_CONTAINER_HOST,
	REDIS_CONTAINER_PORT,
} from '$env/static/private';
import { Redis } from 'ioredis';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { SubscriptionSyncHelper } from '$server/bull/helpers/subscriptions';
import type { SubscriptionInsert, UserInsert } from '$types';

const REDIS_URL = process.env.PRODUCTION ? REDIS_CONTAINER_HOST : 'localhost';
const REDIS_PORT = process.env.PRODUCTION ? Number(REDIS_CONTAINER_PORT) : 6379;

const connection = new Redis({
	host: REDIS_URL,
	port: REDIS_PORT,
	maxRetriesPerRequest: null,
});

export const fetchQueue = new Queue('fetch_subscriptions', {
	connection,
});

export const queueEvents = new QueueEvents('fetch_subscriptions', {
	connection,
});

export const fetchWorker = new Worker(
	'fetch_subscriptions',
	async (job) => {
		const { userId, access } = job.data;

		const sync = new SubscriptionSyncHelper(access);
		let total: number;
		let complete = 0;

		try {
			const cachedTotal = await getFollowedProgress(userId);
            total = cachedTotal.total;
		} catch (err) {
			console.error(err);
			throw err;
		}

		const currentBatchProgress = await getBatchProgress(userId);

		updateProgress(userId, {
			complete: 1,
			total: currentBatchProgress.total,
			status: 'processing',
			message: `beginning initial followed lookup`,
		});
		try {
			const _subscriptions = await sync.getSubscriptions(
				userId,
				async (br: any | string, _: any) => {
                    console.log(complete, total);
					complete = complete + 1;
					try {
						await updateProgress(userId, {
							complete,
							total,
							status: 'running',
							message: `${br.display_name}`,
							color: `${br.color || '#000000'}`,
						});
					} catch (err) {
                        console.error(err);
						throw err;
					}
				},
			);

			await updateProgress(userId, {
				complete: total,
				total,
				status: 'completed',
				message: 'subscription sync ok',
			});

		} catch (err) {
			throw err;
		}
	},
	{
		connection,
		removeOnComplete: { count: 1 },
		removeOnFail: { count: 10 },
	},
);

async function updateProgress(userId: string, progression: any) {
	await connection.set(
		`subscriptions_job_progress:${userId}`,
		JSON.stringify(progression),
		'EX',
		3600,
	);
}

async function updateBatchProgress(userId: string, progression: any) {
	await connection.set(
		`batch_progress:${userId}`,
		JSON.stringify(progression),
		'EX',
		3600,
	);
}

async function getFollowedProgress(userId: string) {
	const cached = await connection.get(`followed_job_progress:${userId}`);
	if (cached) {
		return JSON.parse(cached);
	}
}

async function getBatchProgress(userId: string) {
	const cached = await connection.get(`batch_progress:${userId}`);
	if (cached) {
		return JSON.parse(cached);
	}
}

fetchWorker.on('failed', async (job, error) => {
	console.error(`queued job ${job?.id} failed:`, error);
	if (job?.data.userId) {
		await updateProgress(job.data.userId, {
			complete: null,
			total: job.data.endpoints.length,
			status: 'failed',
			message: error.message,
		});

		await updateProgress(job.data.userId, {
			complete: 3,
			total: 3,
			status: 'failed',
			message: error.message,
		});

	}
});
