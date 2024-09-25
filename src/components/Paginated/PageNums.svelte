<script lang="ts">
	import { totalPages } from '$lib/stores';
	import { onMount } from 'svelte';
	export let changePage: (n: number) => void;
	export let currentPage: number;
	// export let totalPages: number;

	let pages: string[] = [];
	onMount(() => {
		for (let p = 1; p <= $totalPages; ++p) {
			pages.push(p.toString());
		}

		pages = [...pages];
	});
</script>

<div class="flex w-8/12 flex-row items-center justify-center self-center">
	<button
		class={`mr-2 inline-flex justify-self-center font-mono text-xl font-medium ${currentPage !== 0 ? 'hover:opacity-50' : 'cursor-default opacity-0'} transition-all duration-200`}
		on:click={() => changePage(currentPage - 1)}
	>
		{'<<'}
	</button>
	{#each pages as pageNum}
		<div
			class={`font mx-2 bg-gray-200/0 px-1 py-px text-center text-gray-500 transition-all duration-300 ${Number(pageNum) - 1 === currentPage ? 'rounded-md bg-gray-200/100 font-bold' : 'hover:opacity-50'}`}
		>
			<button
				on:click={() => changePage(Number(pageNum) - 1)}
				class="flex flex-row items-end text-center"
				><div>[</div>
				<div class="mx-1">{pageNum}</div>
				<div>]</div></button
			>
		</div>
	{/each}
	<button
		class={`ml-2 inline-flex justify-self-center font-mono text-xl font-medium ${currentPage !== $totalPages - 1 ? 'hover:opacity-50' : 'cursor-default opacity-0'} transition-all duration-200`}
		on:click={() => changePage(currentPage + 1)}
	>
		{'>>'}
	</button>
</div>
