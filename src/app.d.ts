import type { session } from '$auth';
import type { TwitchUser, TwitchTokens, SessionData } from '$types';
import type { Twitch } from 'arctic';

// import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		interface Locals {
			user: TwitchUser | null;
			tokens: TwitchTokens | null;
			session: SessionData | null;
            alert: any | undefined;
		}
	}
}

export {};
