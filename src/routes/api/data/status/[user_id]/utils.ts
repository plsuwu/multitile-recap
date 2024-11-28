import type { JobProgress } from "$types/queue/types";

export const activeConnections = new Map<
    string,
    ReadableStreamDefaultController
>();

export function notifyClients(
    message: JobProgress,
) {
    let type = 'info';
    switch (message.status) {
        case 'failed':
            type = 'error';
            break;

        case 'completed':
            type = 'success';
            break;

        default:
            type = 'info';
            break;
    }

    const event = {
        type: 'sync-status',
        data: { message, type },
    };

    activeConnections.forEach((controller) => {
        console.log('CONTROLLER->', controller, `${JSON.stringify(event)}\n\n`);

        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
    });
}
