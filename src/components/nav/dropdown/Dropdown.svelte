<script lang="ts">
	import Divider from '$components/divider/Divider.svelte';

	import type { TwitchUser } from '$types';
	import { scale } from 'svelte/transition';
	import { readableColor } from '$client/utils';
	import { onMount } from 'svelte';

	let { parentFn, user }: { parentFn: () => void; user: TwitchUser } =
		$props();

	let usernameColor = $state({ fg: '', bg: '' });

	onMount(() => {
		if (user && user.color) {
			usernameColor = readableColor(user.color ?? '#000000');
		}
	});
</script>

{#key user}
	<div
		class="absolute z-50 flex w-[175px] max-w-[175px] flex-col items-center rounded-md border bg-white font-medium"
	>
		<div
			class="relative flex w-full flex-col items-end justify-end rounded-md"
		>
			{#if user}
				<div
					class="my-2 flex w-full cursor-default flex-row justify-between px-5"
				>
					<img
						src={user.profile_image_url}
						class="group mr-2 size-6 items-center justify-center self-center rounded-full"
						alt={`${user.display_name} profile image`}
					/>
					<div class="flex flex-row items-center">
						omg
						<span
							class="mx-1 rounded-md px-1 py-px text-center"
							style={`color: ${usernameColor.fg === 'rgba(0, 0, 0, 1)' ? 'white' : usernameColor.fg}; background-color: ${usernameColor.bg};`}
						>
							{user.display_name}
						</span>
						hiii
					</div>
				</div>
				<Divider />
				<div class="flex w-full flex-col text-start">
					<a
						onclick={parentFn}
						class="m-0.5 rounded px-1 py-0.5 transition-all duration-200 ease-in-out hover:bg-gray-200/90"
						href="/follows"
						data-sveltekit-preload-data="off"
						><div class="px-2 py-1">following</div></a
					>
					<a
						onclick={parentFn}
						class="m-0.5 rounded px-1 py-0.5 transition-all duration-200 ease-in-out hover:bg-gray-200/90"
						href="/subscriptions"
						data-sveltekit-preload-data="off"
						><div class="px-2 py-1">subscriptions</div></a
					>
				</div>
				<Divider />

				<div class="flex w-full flex-col text-start">
					<a
						onclick={parentFn}
						class="m-0.5 rounded px-1 py-0.5 transition-all duration-200 ease-in-out hover:bg-gray-200/90"
						href="/logout"
						data-sveltekit-preload-data="off"
						><div class="px-2 py-1">logout</div></a
					>
				</div>
			{:else}
				<div class="flex w-full flex-col">
					<a
						class="m-0.5 rounded px-1 py-0.5 transition-all duration-200 ease-in-out hover:bg-gray-200/90"
						href="/login"
						onclick={parentFn}
						data-sveltekit-preload-data="off"
					>
						<div class="flex flex-row justify-between px-2 py-1">
							<div>login</div>
							<div>{'->'}</div>
						</div>
					</a>
				</div>
			{/if}
		</div>
	</div>
{/key}
