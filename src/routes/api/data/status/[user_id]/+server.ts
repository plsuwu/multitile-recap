import type { RequestEvent } from '@sveltejs/kit';
import { processors } from '$server/bull/processors';
import { connection as redis } from '$redis/redis';
import { activeConnections, notifyClients } from './utils';


export const GET = async (event: RequestEvent) => {
    const { user } = event.locals;
    console.log('RECEIVED AN EVENT:', event);
    if (!user) {

        return new Response('LOGIN_REQUIRED', {
            status: 400,
        });
    }

    const progress = await Promise.all(
        Object.keys(processors).map(async (processor) => {
            console.log(`progress:${processor}:${user.id}`);
            const data = await redis.get(`progress:${processor}:${user.id}`);
            return data ? JSON.parse(data) : null;
        }),
    );

    console.log(progress);

    const stream = new ReadableStream({
        start(controller) {
            activeConnections.set(user.id, controller);

            progress.forEach((proc) => {
                if (proc) {
                    console.log('PROC->', proc.processor);
                    notifyClients(proc);
                }
            });

            return () => {
                activeConnections.delete(user.id);
            };
        },
    });

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
        },
    });
};

