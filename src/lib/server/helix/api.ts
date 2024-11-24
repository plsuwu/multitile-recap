import { log } from '$logging';
import { HELIX } from './utils';

export const hx = {
	user: async (headers: Headers, _userId?: string) => {
		const response = await fetch(HELIX.USER, {
			method: 'GET',
			headers: headers,
		});

		return await response.json();
	},

	colors: async (headers: Headers, userId: string) => {
		const response = await fetch(`${HELIX.COLOR}?user_id=${userId}`, {
			method: 'GET',
			headers: headers,
		});

		return await response.json();
	},
};
