<script lang="ts">
	import { navigating, page } from '$app/stores';
	// import { loading } from '$lib/stores';
	import { BarLoader } from 'svelte-loading-spinners';
	import HeroiconsArrowUpRight from '~icons/heroicons/arrow-up-right';

	let loading = false;
	$: destination = $navigating?.to;

	console.log(destination);

	export let href: string;
	export let text: string;
	export let targetBlank: boolean = false;
</script>

{#key $page}
	{#if loading}
		<BarLoader />
	{:else}
		<a
			{href}
			target={targetBlank ? '_blank' : '_self'}
			referrerpolicy="no-referrer"
			class="flex flex-row transition-opacity duration-100 hover:opacity-55"
		>
			<div>{text}</div>
			{#if targetBlank}
				<HeroiconsArrowUpRight
					style="font-size: 8px; margin-left: 1px; margin-top: 3px;"
				/>
			{/if}
		</a>
	{/if}
{/key}
