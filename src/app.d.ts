import type { session } from '$auth';
import type { Twitch } from 'arctic';

// import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		interface Locals {
			user: any | null;
			tokens: session.SessionTokens | null;
			session: session.SessionData | null;
			syncStatus: Promise<any | any[]>;
		}
	}
}

export {};
