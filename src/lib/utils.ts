import { TWITCH_CLIENT_ID } from '$env/static/private';

const accessIsExpired = (expiry: string | any): boolean => {
	return Number(expiry) <= Date.now();
};

const buildAuthHeader = (
	token: string,
	useOAuth: boolean = false,
	client: string = TWITCH_CLIENT_ID,
	xArgs: Record<string, string>[] | null = null
): Headers => {

	const headerType = useOAuth ? 'OAuth' : 'Bearer';
	const headers: Headers = new Headers({
		Authorization: `${headerType} ${token}`,
		'client-id': client
	});

	if (xArgs) {
		xArgs.forEach((head) => {
			Object.entries(head).forEach(([key, value]) => {
				headers.append(key, value);
			});
		});
	}

	return headers;
};

export { buildAuthHeader, accessIsExpired };
