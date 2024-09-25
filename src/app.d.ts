import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}

	namespace Lucia {
		type Auth = import('@server/auth/lucia').Auth;
	}
}

export {};
