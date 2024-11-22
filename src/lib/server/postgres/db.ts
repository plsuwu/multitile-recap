import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from '$pg/schema';

export const db = drizzle({
	schema,
	connection: {
		connectionString: DATABASE_URL
	},
	casing: 'snake_case'
});
