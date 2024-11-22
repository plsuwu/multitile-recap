import { dev } from '$app/environment';
import pino from 'pino';

const DEFAULT_LOG_LEVEL = dev ? 'trace' : 'silent';

export const logger = pino({
    level: DEFAULT_LOG_LEVEL,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: true,
        },
    },
})



