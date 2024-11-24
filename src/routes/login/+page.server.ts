import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { log } from '$logging';
import { invalidateAll } from '$app/navigation';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const res = await event.fetch('/api/auth/login', {
		method: 'GET',
	});

	const { provider } = await res.json();
	log.debug(event.locals, provider);

	return {
		provider,
	};
};
