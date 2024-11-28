export type BaseJobData = {
    userId: string;
    access: string;
}

export type JobProgress = {
    processor: string;
    complete: number;
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
} & Partial<BaseJobData>;
