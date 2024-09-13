import { TWITCH_CLIENT_ID } from '$env/static/private';

const buildAuthorizedHeader = (
	token: string,
	useOAuth: boolean = false,
	useCustomAgent: boolean = false,
	exHeaderArgs: Record<string, string> | null = null
): Headers => {
	const headerType = useOAuth ? 'OAuth' : 'Bearer';
	const agent =
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

	const headers: Headers = new Headers({
		Authorization: `${headerType} ${token}`,
		'Client-Id': TWITCH_CLIENT_ID,
	});

	if (useCustomAgent) {
		headers.append('User-Agent', agent);
	}

	if (exHeaderArgs) {
		Object.entries(exHeaderArgs).forEach(([key, value]) => {
			// console.log(key, value);
			headers.append(key, value);
		});
	}

	return headers;
};

export { buildAuthorizedHeader };
