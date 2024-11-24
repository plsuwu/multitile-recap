import { log } from '$logging';
import { pg } from '$pg/postgres';

import { KeyPrefix } from '$redis/redis';
import redis from '$redis';
import type { TwitchTokens, TwitchUser, UserInsert } from '$types';

export async function makeNewUser(user: UserInsert, tokens: TwitchTokens) {
	const cached: TwitchUser = {
		id: user.id,
		display_name: user.display_name,
		login: user.login,
		profile_image_url: user.profile_image_url,
		color: user.color || '#000000',
	};

	await redis.setCacheUser(user.id, cached);
	await redis.setCacheTokens(user.id, tokens);

	await pg.insert.user(user);
}
