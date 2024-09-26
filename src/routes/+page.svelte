<script lang="ts">
	import { page } from '$app/stores';
	import { getRgba, handleRefresh } from '$lib/internal';
	import { BarLoader } from 'svelte-loading-spinners';
	import LinkTo from '@components/LinkTo/LinkTo.svelte';
	import Error from '@components/Error/Error.svelte';
	import HeroiconsArrowPath from '~icons/heroicons/arrow-path';
	import HeroiconsArrowLeftStartOnRectangle from '~icons/heroicons/arrow-left-start-on-rectangle';
	import HeroiconsArrowSmallRight from '~icons/heroicons/arrow-small-right';

	const { display_name, profile_image_url, color } = $page.data;
	$: e = $page.url.searchParams.get('err');
	$: r = $page.url.searchParams.get('r');

	$: refreshing = false;

	async function refresh() {
		refreshing = true;

		const res = await handleRefresh();
		if (!res.error) {
			window.location.href = '/?r=ok';
		} else {
			window.location.href = `/?err=${res.location}`;
		}

		refreshing = false;
	}

	const formattedColor = color ? getRgba(color) : { bg: '#FFF', fg: '#000' };
</script>

<div class="absolute top-2/3 w-full">
	<div class="flex flex-col items-center justify-center">
		<div class="inline-flex w-1/2 flex-col text-wrap break-words xl:w-1/5">
			{#if e}
				<div class="mb-4 text-center text-base font-bold text-red-700">
					<Error {e} />
				</div>
			{/if}
		</div>
	</div>
</div>
{#if $page.data.display_name && $page.data.profile_image_url}
	<div
		class="flex h-full w-full flex-col items-center justify-center overflow-y-hidden text-lg"
	>
		<div
			class="flex h-full w-full flex-row items-center justify-around px-4 text-sm sm:w-4/5 md:w-1/2 lg:px-0 lg:text-lg xl:w-1/3 xl:text-xl 2xl:w-1/4"
		>
			<div class="flex flex-1 flex-col items-start">
				<div class="flex flex-col items-center text-xl">
					<div
						class="mr-3 flex flex-row items-center justify-center text-center"
					>
						<div>omg</div>
						<span
							class="mx-1 mb-1 mt-1 flex flex-1 justify-center rounded-[16px] px-[7px] font-semibold italic transition-all duration-200 hover:brightness-90"
							style={`color: ${formattedColor.fg}; background-color: ${formattedColor.bg}; background`}
						>
							<LinkTo
								href={`https://www.twitch.tv/${$page.data.login}`}
								text={`/${display_name}`}
								targetBlank={true}
							/>
						</span>
						<div>hiii</div>
					</div>
					<img
						src={profile_image_url}
						alt="user profile"
						class="mt-2 size-28 flex-1 rounded-full shadow-md lg:size-52"
					/>
				</div>
			</div>
			<div class="mt-7 flex h-full w-full flex-1 flex-col items-end">
				<a
					href="/follows"
					class="mb-1 flex flex-row items-center justify-center transition-all duration-200 hover:opacity-55"
				>
					<div class="mr-2">following</div>
					<HeroiconsArrowSmallRight />
				</a>
				<a
					href="/recaps"
					class="mb-1 flex flex-row items-center justify-center transition-all duration-200 hover:opacity-55"
				>
					<div class="mr-2">recaps</div>
					<HeroiconsArrowSmallRight />
				</a>
				<div class="">
					{#if $page.data.cache && !r}
						<div></div>
						{#if refreshing}
							<div
								class="flex flex-row items-center justify-center pt-1"
							>
								<div class="invisible mr-2">refresh</div>
								<div
									style={`background-color: ${formattedColor.bg}`}
								>
									<BarLoader color={formattedColor.fg} />
								</div>
							</div>
						{:else}
							<button
								class="flex flex-row items-center justify-center pt-1 transition-opacity duration-100 hover:opacity-55"
								on:click={refresh}
							>
								<div class="mr-2">refresh</div>
								<HeroiconsArrowPath />
							</button>
						{/if}
					{:else}
						<div></div>
						{#if r}
							<div
								class="flex flex-0 flex-row items-center justify-center pt-2 transition-opacity duration-100 hover:opacity-55"
							>

								<div class="mr-2 invisible">refresh</div>
								<span class='text-sm text-gray-500 mt-1'>refreshed.</span>
							</div>
						{:else}
							<div
								class="flex-0 invisible flex flex-row items-center justify-center pt-3 text-base italic"
							>
								*
							</div>
						{/if}
					{/if}
				</div>
				<a
					href="/api/logout"
					class="mt-8 flex flex-row items-center justify-center transition-all duration-200 hover:opacity-55"
				>
					<HeroiconsArrowLeftStartOnRectangle class="text-red-600" />
					<div class="ml-2">logout</div>
				</a>
			</div>
		</div>
	</div>
{:else}
	<div class="flex h-full flex-col">
		<div class="flex w-full flex-col items-center self-center">
			<div class="w-4/5 text-lg font-medium text-justify">
                Generate a tiled monthly recap for multiple Twitch subscriptions
			</div>
			<p class="text-justify">(+ some other stats about followage & subscriptions)</p>
		</div>
		<div class="flex flex-row items-center justify-center text-2xl">
			<div class="mt-8 flex flex-row justify-center text-center font-bold">
				<div>[</div>
				<a
					href="/api/login"
					class="text-semibold transition-opacity duration-200 hover:opacity-25"
					>auth w/ <span class="text-[#a970ff]">twitch.tv</span>
					{'->'}</a
				>
				<div>]</div>
			</div>
		</div>
	</div>
{/if}
