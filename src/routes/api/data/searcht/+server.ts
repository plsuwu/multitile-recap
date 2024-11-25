import { db } from '$server/postgres/db';
import { pg } from '$server/postgres/postgres';
import { users } from '$server/postgres/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { ilike } from 'drizzle-orm';

export const GET = async (event: RequestEvent) => {
	const q = event.url.searchParams.get('q');
	if (!q) {
		return json({ results: [] });
	}

	const dbRes = await db.query.users
		.findMany({
			where: ilike(users.login, `${q}%`),
		})
		.execute();

	console.log(q);
	console.log(dbRes);
	return json({
		results: dbRes,
	});
};
