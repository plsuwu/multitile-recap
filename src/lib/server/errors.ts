export class RateLimitError extends Error {
	reset: number;
	constructor(message: string, reset?: string) {
		super(message);

		this.reset = reset ? Number(reset) : Date.now() + 60 * 1000;
		this.name = 'RateLimitError';
	}
}

export class APIError extends Error {
	constructor(
		message: string,
        public status: number,
	) {
		super(message);
		this.name = 'APIError';
	}
}
