<script lang="ts">
	import { onMount } from 'svelte';

	let { data }: any = $props();

	function refresh() {
		window.location.reload();
	}

	onMount(() => {
		if (data.provider) {
			window.location.href = data.provider;
		}
	});

	$inspect(data);
</script>

<div class="flex h-full flex-col">
	{#if !data || !data.provider}
		<div class="flex flex-row items-center justify-center">
			seems like there was an issue creating an oauth uri for you -
			click&nbsp;<button
				class="underline hover:text-gray-400"
				onclick={refresh}>here</button
			>&nbsp;to retry.
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center">
			<div>you should be redirected to Twitch in a moment.</div>
			<div>
				click
				<a href={data.provider} class="underline hover:text-gray-400"
					>here</a
				>
				if you are still waiting after a few seconds.
			</div>
		</div>
	{/if}
</div>
