import type { BaseJobData, JobProgress } from '$types/queue/types';
import { notifyClients } from '../../../../routes/api/data/status/[user_id]/utils';

export abstract class DataProcessor {
	abstract readonly name: string;
	abstract process(data: BaseJobData): Promise<void>;

	constructor(
		protected db: typeof import('$pg/db').db,
		protected redis: typeof import('$redis/redis').connection,
	) {}

	protected async updateProgress(progress: Omit<JobProgress, 'processor'>) {
		const fullProgress: JobProgress = {
			...progress,
			processor: this.name,
		};

		console.log(
			`progress:${this.name}:${progress.userId} -> UPDATE:`,
			this.name,
			fullProgress,
		);

        notifyClients(fullProgress);
		await this.redis.set(
			`progress:${this.name}:${progress.userId}`, // ??
			JSON.stringify(fullProgress),
			'EX',
			3600,
		);
	}
}
