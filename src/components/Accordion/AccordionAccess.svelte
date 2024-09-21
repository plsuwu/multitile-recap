<script lang="ts">
	import { slide } from 'svelte/transition';
	export let open: boolean;

	const toggle = () => {
		open = open ? false : true;
	};
</script>

<div class="flex w-full flex-col">
	<button
		class="flex w-full min-w-full flex-row items-center justify-between rounded-md border border-black/25 bg-gray-400/35 p-2 font-semibold transition-all duration-200 hover:bg-black/30"
		on:click={toggle}
	>
		<div class='text-lg'><slot name="title"></slot></div>
		<div class="flex flex-row items-center align-middle justify-end font-mono">
			<div>[</div>
			{#if open}
				<div>-</div>
			{:else}
				<div>+</div>
			{/if}
			<div>]</div>
		</div>
	</button>
	{#if open}
		<div
			class="rounded-bl rounded-br-md border-b border-l border-r border-black/10 bg-black/5"
			transition:slide
		>
			<div class="p-4">
				<slot name="details"></slot>
			</div>
		</div>
	{/if}
</div>
