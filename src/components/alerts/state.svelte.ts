import type { AlertProps as Alert } from '$types/components/alert';
import { setContext, getContext } from 'svelte';

const ALERT_KEY = Symbol('ALERT_KEY');

export class AlertState {
	alerts = $state<Alert[]>([]);
	alertTimeoutMap = new Map<string, NodeJS.Timeout>();
    alertType: 'sync' | 'error' = 'error';

	constructor() {
        $effect(() => {
            return () => {
                for (const timeout of this.alertTimeoutMap.values()) {
                    clearTimeout(timeout);
                }

                this.alertTimeoutMap.clear();
            }
        });
    }

	add(alertType: 'error' | 'sync', message: string, status: number, title: 'error' | 'sync' = alertType,  duration = 5000) {
		const id = crypto.randomUUID();
		this.alerts.push({
			id,
            alertType,
			title,
			message,
			status,
		});

		this.alertTimeoutMap.set(
			id,
			setTimeout(() => {
				this.remove(id);
			}, duration),
		);
	}

	remove(id: string) {
        const timeout = this.alertTimeoutMap.get(id);
        if (timeout) {
            clearTimeout(timeout);
            this.alertTimeoutMap.delete(id);
        }

		this.alerts = this.alerts.filter((alerts) => alerts.id !== id);

	}
}

export function setAlertState() {
    return setContext(ALERT_KEY, new AlertState());
}

export function getAlertState() {
    return getContext<ReturnType<typeof setAlertState>>(ALERT_KEY)
}
