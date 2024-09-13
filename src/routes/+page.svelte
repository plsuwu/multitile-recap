<script lang="ts">
	import { page } from '$app/stores';
	// console.log($page);

	const { display_name, profile_image_url } = $page.data;
</script>

<div class="mb-12 mt-4 flex w-max flex-col space-y-2">
	<a
		class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20"
		href="/api/test">test db</a
	>
	<a
		class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20"
		href="/api/login?t=true">auth: test new user</a
	>
	<a
		class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20"
		href="/api/login">auth: test user from db</a
	>
	<a
		class="rounded border p-0.5 transition-colors duration-100 hover:bg-black/20"
		href="/api/generate">auth: test generate</a
	>
</div>

{#if $page.data.display_name && $page.data.profile_image_url}
	<div>
		<span>omg <span class="text-lg">{display_name}</span> hiii</span>
	</div>
	<img src={profile_image_url} alt="user profile" class="size-52" />
	<a href="/api/generate">run a generation {'->'}</a>
{/if}
