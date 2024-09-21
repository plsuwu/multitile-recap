<script lang="ts">
	import { page } from '$app/stores';

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
		class="flex h-screen w-screen flex-col items-center justify-center text-lg"
	>
		{#if e && e === 'invalid_token'}
			<div class="my-4 text-center text-base font-bold text-red-700">
				The Authentication token for the recaps endpoint was rejected by
				Twitch's server.
				<br />
				Please hit recaps and double check that you are providing the correct
				token.
			</div>
		{/if}
		<div class="mb-12">
			<div class="text-center">
				omg <span
					class="rounded-xl px-2 text-2xl"
					style={`color: ${formattedColor.fg}; background-color: ${formattedColor.bg}; background`}
					>@{display_name}</span
				> hiii
			</div>
		</div>
		<img
			src={profile_image_url}
			alt="user profile"
			class="size-52 rounded-full"
		/>
		<a
			href="/api/generate"
			class="mt-14 transition-opacity duration-100 hover:opacity-55"
			>{'following & subs ->'}</a
		>
		<a
			href="/api/generate?wants=true"
			class="mt-2 transition-opacity duration-100 hover:opacity-55"
			>recaps {'->'}</a
		>
		<a
			href="/api/logout"
			class="mb-14 mt-6 transition-opacity duration-100 hover:opacity-55"
			>{'<-'} logout</a
		>
	</div>
{:else}
	<div
		class="flex h-screen w-screen flex-row items-center justify-center text-2xl"
	>
		<div class="flex flex-col text-center">
			<div class="my-4 flex flex-row justify-center text-center">
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
