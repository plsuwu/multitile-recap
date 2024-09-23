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
		class={`inline-flex justify-self-center font-mono text-xl font-medium mr-2 ${currentPage !== 0 ? 'hover:opacity-50' : 'cursor-default opacity-0'} transition-all duration-200`}
		on:click={() => changePage(currentPage - 1)}
	>
		{'<<'}
	</button>
	{#each pages as pageNum}
		<div
			class={`text-center mx-2 py-px px-1 font bg-gray-200/0 text-gray-500 transition-all duration-300 ${Number(pageNum) - 1 === currentPage ? 'font-bold bg-gray-200/100 rounded-md' : 'hover:opacity-50'}`}

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
		class={`inline-flex justify-self-center font-mono text-xl font-medium ml-2 ${currentPage !== $totalPages - 1 ? 'hover:opacity-50' : 'cursor-default opacity-0'} transition-all duration-200`}
		on:click={() => changePage(currentPage + 1)}
	>
		{'>>'}
	</button>
</div>
