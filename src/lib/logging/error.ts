export interface APIError {
	code: string;
	message: string;
	userMessage?: string;
	status: number;
}

export class APIError extends Error {
	constructor(
		message: string,
		public code: string,
		public status: number,
		public reason: string,
	) {
		super(message);
		this.name = 'APIError';
	}
}

export class AuthenticationError extends APIError {
	constructor(message: string, userMessage?: string, status?: number) {
		super(message, 'AUTH_PROVIDER_ERROR', status || 400, '');
	}
}
