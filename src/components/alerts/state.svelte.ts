import type { AlertProps as Alert } from '$types/components/alert';
import type { JobProgress } from '$types/queue/types';
import { setContext, getContext } from 'svelte';

const ALERT_KEY = Symbol('ALERT_KEY');

export class AlertState {
    alerts = $state<Alert[]>([]);
    duration?: number;
    timeoutMap = new Map<string, { alert: Alert; timeout: NodeJS.Timeout }>();

    constructor() {
        $effect(() => {
            return () => {
                for (const timeout of this.timeoutMap.values()) {
                    clearTimeout(timeout.timeout);
                }

                this.timeoutMap.clear();
            };
        });
    }

    add(
        type: 'info' | 'success' | 'warning' | 'error',
        message: JobProgress,
        userId?: string,
        duration = 10000,
    ) {
        const id = userId ? userId : crypto.randomUUID();
        const fmt =
            message.total > 0 && message.complete > 0 && message.complete < message.total
                ? `syncing ${message.processor}: ${message.complete} of ${message.total} broadcasters`
                :
                    message.status === 'completed'
                        ? `sync ${message.processor} job ${message.status}.`
                        : `sync ${message.processor} job ${message.status}.`;
        const alert = {
            id,
            type,
            title: 'Sync',
            message: fmt,
        };

        const exists = this.timeoutMap.get(id);
        console.log(exists);

        if (exists) {
            this.remove(id);
        }
        this.alerts.push(alert);
        this.timeoutMap.set(id, {
            alert,
            timeout: setTimeout(() => {
                this.remove(id);
            }, duration),
        });
    }

    update(id: string, updates: { alert: Alert; timeout: NodeJS.Timeout }) {
        const timeout = this.timeoutMap.get(id);
        if (timeout && timeout.alert) {
            this.timeoutMap.set(id, updates);
        }
    }

    remove(id: string) {
        const timeout = this.timeoutMap.get(id);
        console.log(timeout);

        if (timeout) {
            clearTimeout(timeout.timeout);
            this.timeoutMap.delete(id);
        }

        this.alerts = this.alerts.filter((alerts) => alerts.id !== id);
    }
}

export function setAlertState() {
    return setContext(ALERT_KEY, new AlertState());
}

export function getAlertState() {
    return getContext<ReturnType<typeof setAlertState>>(ALERT_KEY);
}
