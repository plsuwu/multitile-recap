import { TWITCH_CLIENT_ID } from '$env/static/private';

const buildAuthorizedHeader = (
	token: string,
	useOAuth: boolean = false,
	useCustomAgent: boolean = false,
	clientType: string = TWITCH_CLIENT_ID,
	exHeaderArgs: Record<string, string>[] | null = null
): Headers => {
	const headerType = useOAuth ? 'OAuth' : 'Bearer';
	const headers: Headers = new Headers({
		Authorization: `${headerType} ${token}`,
		'client-id': clientType,
	});

	if (exHeaderArgs) {
		exHeaderArgs.forEach((head) => {
			Object.entries(head).forEach(([key, value]) => {
				headers.append(key, value);
			});
		});
	}

	// console.log(headers);
	return headers;
};

export { buildAuthorizedHeader };
