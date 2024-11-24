import type { UserInsert } from '$types';
import { db } from './db';
import { users } from './schema';

export const pg = {
	insert: {
		user: async (data: UserInsert) => {
			db.insert(users)
				.values(data)
				.onConflictDoUpdate({
					target: users.id,
					set: {
						login: data.login,
						display_name: data.display_name,
						profile_image_url: data.profile_image_url,
						description: data.description,
						color: data.color,
						last_sync: new Date(),
					},
				});
		},
	},
};
