<script lang="ts">
	import { page } from '$app/stores';
	import type { FollowsData, UserSubscriptions } from '$lib/types';
	import Paginated from '@components/Paginated/Paginated.svelte';

	$: open = false;
	const { following, subscriptions } = $page.data;
	let subIcons: { broadcaster_name: string, badge_url: string }[];



</script>

<div class="my-8 flex w-full flex-col items-center px-6 py-4 xl:w-1/2 xl:px-2">
	<a href="/" class="w-full self-start">
		{'<- back'}
	</a>
	<Paginated {following} {subscriptions} {subIcons} />
</div>
