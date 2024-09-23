<script lang="ts">
	import { page } from '$app/stores';
	import LinkTo from '@components/LinkTo/LinkTo.svelte';
    import { loading } from '$lib/stores';

	const { display_name, profile_image_url, color } = $page.data;
	const e = $page.url.searchParams.get('e');

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
		class="flex h-screen w-screen flex-col items-center justify-center text-lg overflow-y-hidden"
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
			class="flex 2xl:w-1/3 xl:w-1/3 w-full px-4 lg:px-0 sm:w-4/5 md:w-1/2 flex-row items-center justify-center h-full text-sm lg:text-lg xl:text-xl"
		>
			<div class="w-full flex flex-col items-start flex-1 mt-7 h-full justify-center">
				<LinkTo href="/api/logout" text={'<- logout'} />
			</div>
			<div class='flex flex-col items-center text-xl'>
				<div class="flex flex-row items-center justify-center mr-3">
					<div>omg</div>
					<span
						class="mx-1 mb-1 justify-center rounded-[16px] px-[7px] mt-1 font-semibold italic transition-all duration-200 hover:brightness-90 flex flex-1"
						style={`color: ${formattedColor.fg}; background-color: ${formattedColor.bg}; background`}
					>
						<LinkTo
							href={`https://www.twitch.tv/${$page.data.login}`}
							text={`/${display_name}`}
						/>
					</span>
					<div>hiii</div>
				</div>
				<img
					src={profile_image_url}
					alt="user profile"
					class="lg:size-52 size-28 rounded-full mt-2 flex-1"
				/>
			</div>

			<div class="flex flex-col items-end h-full justify-center mt-7 w-full flex-1">
				<LinkTo href="/api/generate" text={'following ->'} />
				<LinkTo href="/api/generate?wants=true" text={'recaps ->'} />
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
