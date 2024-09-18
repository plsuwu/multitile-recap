import { redirect, type RequestEvent } from '@sveltejs/kit';
import { testCacheRw } from '@server/tests';

export async function GET(event: RequestEvent): Promise<Response> {
    if (!import.meta.env.PROD) {
	    testCacheRw();
    }

	redirect(302, '/');
}
