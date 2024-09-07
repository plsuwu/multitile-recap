<script lang="ts">
	import HLink from '@/components/HLink.svelte';
	import Error from '@/components/Error.svelte';
	import { page } from '$app/stores';

	let where = '';
	let why = '';

	if ($page.data.error && $page.data.error.where && $page.data.error.why) {
		where = $page.data.error.where;
		why = $page.data.error.why;
	}
</script>

<div>
	<!-- {#if where !== '' && why !== ''} -->
	<!-- 	<Error {where} {why} /> -->
	<!-- {/if} -->

	{#if $page.data.displayName}
		 <div class='flex flex-col items-center justify-center'>
			<div class='my-2 text-xl'>omg {$page.data.displayName} hiii</div>
			<img src={$page.data.profileImageUrl} alt="user profile" />
		</div>
		<div class="flex flex-col my-4">
			<HLink href={`/logout?t=${$page.data.access}`} text={'<- sign out'} />
			<HLink href={`/follows`} text={'generate ->'} />
		</div>
	{:else}
		<div></div>

		<HLink href={'/auth'} text={'auth with twitch ->'} />
	{/if}
</div>
