import type { AlertProps } from "$types/components/alert";
import { AlertState } from "$components/error/error-state.svelte";

export class APIError extends Error {
    userMessage: AlertProps;
    constructor(message: string, code: string, status = 500) {
        super(message);
        this.userMessage = {
            id:
        }
    }
}


