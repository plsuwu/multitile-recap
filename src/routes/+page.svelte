<script lang="ts">
	import { page } from '$app/stores';
	import LinkTo from '@components/LinkTo/LinkTo.svelte';
	import HeroiconsArrowPath from '~icons/heroicons/arrow-path';


	const { display_name, profile_image_url, color } = $page.data;
	const e = $page.url.searchParams.get('e');
	$: r = $page.url.searchParams.get('ref_ok');

	function getRgba(color: string) {
		const hex = color.slice(1);
		let r = parseInt(hex.substring(0, 2), 16);
		let g = parseInt(hex.substring(2, 4), 16);
		let b = parseInt(hex.substring(4, 6), 16);

		const backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
		const darkest = Math.min(r, g, b);
		if (darkest === r) {
			r = Math.floor(r * 0.1);
			g = Math.floor(g * 0.5);
			b = Math.floor(b * 0.5);
		} else if (darkest === g) {
			r = Math.floor(r * 0.5);
			g = Math.floor(g * 0.1);
			b = Math.floor(b * 0.5);
		} else if (darkest === b) {
			r = Math.floor(r * 0.5);
			g = Math.floor(g * 0.5);
			b = Math.floor(b * 0.1);
		}

		const foregroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
		return { fg: foregroundColor, bg: backgroundColor };
	}

	const formattedColor = color ? getRgba(color) : { bg: '#FFF', fg: '#000' };
</script>

{#if $page.data.display_name && $page.data.profile_image_url}
	<div
		class="flex h-screen w-screen flex-col items-center justify-center overflow-y-hidden text-lg"
	>
		{#if e && e === 'invalid_token'}
			<div class="mb-4 text-center text-base font-bold text-red-700">
				The Authentication token for the recaps endpoint was rejected by
				Twitch's server.
				<br />
				Please hit recaps and double check that you are providing the correct
				token.
			</div>
		{/if}
		<div
			class="flex h-full w-full flex-row items-center justify-center px-4 text-sm sm:w-4/5 md:w-1/2 lg:px-0 lg:text-lg xl:w-1/3 xl:text-xl 2xl:w-1/3"
		>
			<div
				class="mt-7 flex h-full w-full flex-1 flex-col items-center justify-center"
			>
				<a href='/api/logout'>logout</a>
			</div>
			<div class="flex flex-col items-center text-xl">
				<div class="mr-3 flex flex-row items-center justify-center">
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
					class="mt-2 size-28 flex-1 rounded-full border border-black p-1 shadow-md lg:size-52"
				/>
				<div class="mt-4">
					{#if $page.data.cache && !r}
                    <div></div>
						<button
							class="flex flex-row items-center justify-center pt-1 transition-opacity duration-100 hover:opacity-55"
						>
							<div class="mr-2">refresh</div>
							<HeroiconsArrowPath />
						</button>
					{:else}
						<div></div>
						{#if r}
							<div
								class="flex-0 flex flex-row items-center justify-center pt-3 text-sm italic text-gray-500/55"
							>
								refreshed.
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
			</div>

			<div
				class="mt-7 flex h-full w-full flex-1 flex-col items-center justify-center"
			>
				<a href='/follows'>following</a>
				<a href='/recaps'>recaps</a>
			</div>
		</div>
	</div>
{:else}
	<div
		class="flex h-screen w-screen flex-row items-center justify-center text-2xl"
	>
		<div class="flex flex-col text-center">
			<div class="mt-4 flex flex-row justify-center text-center">
				<div>[</div>
				<a
                    href='/api/login'
					class="text-semibold transition-opacity duration-200 hover:opacity-25"
					>auth w/ <span class="text-[#a970ff]">twitch.tv</span>
					{'->'}</a
				>
				<div>]</div>
			</div>
		</div>
	</div>
{/if}
