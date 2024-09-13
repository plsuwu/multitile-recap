import { test } from '@/lib/server/db';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	// test();

	redirect(302, '/');
}
