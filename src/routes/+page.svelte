<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
	// console.log($page);

	const { display_name, profile_image_url } = $page.data;
</script>

<!-- {#if dev} -->
<!-- 	<div class="mb-12 mt-4 flex w-max flex-col space-y-2"> -->
<!-- 		<a -->
<!-- 			class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20" -->
<!-- 			href="/api/test">test db</a -->
<!-- 		> -->
<!-- 		<a -->
<!-- 			class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20" -->
<!-- 			href="/api/login?t=true">auth: test new user</a -->
<!-- 		> -->
<!-- 		<a -->
<!-- 			class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20" -->
<!-- 			href="/api/login">auth: test user from db</a -->
<!-- 		> -->
		<a
			class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20"
			href="/api/test">test cache worker</a
		>
<!-- {/if} -->

{#if $page.data.display_name && $page.data.profile_image_url}
	<div class="flex h-screen w-screen flex-col items-center justify-center">
		<div class="my-2">
			<div>
				omg <span class="rounded-xl bg-black/25 px-2 text-xl"
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
			>recaps {'->'}</a
		>
	</div>
{:else}
	<div
		class="flex h-screen w-screen flex-row items-center justify-center text-2xl"
	>
		<div>[</div>
		<!-- <div class="flex flex-col items-center"> -->
		<a
			href="/api/login"
			class="text-semibold transition-opacity duration-200 hover:opacity-25"
			>auth w/ <span class="text-[#a970ff]">twitch.tv</span> {'->'}</a
		>
		<!-- <div>{':)'}</div> -->
		<!-- </div> -->
		<div>]</div>
	</div>
{/if}
