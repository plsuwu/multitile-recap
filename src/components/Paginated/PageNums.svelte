<script lang="ts">
	export let changePage: (n: number) => void;
	export let currentPage: number;
	export let totalPages: number;

	const pages = new Array();
	for (let p = 1; p <= totalPages; ++p) {
		pages.push(p.toString());
	}
</script>

<div class="flex w-8/12 flex-row items-center justify-center self-center">
	<button
		class="inline-flex justify-self-center font-mono text-xl font-medium"
		on:click={() => changePage(currentPage - 1)}
	>
		{'<'}
	</button>
	{#each pages as pageNum}
		<div
			class={`text-center font-medium ${Number(pageNum) - 1 === currentPage ? 'mt-2 text-blue-500' : ''}`}
		>
			<button
				on:click={() => changePage(Number(pageNum) - 1)}
				class="mx-3 flex flex-row items-end"
				><div>[</div>
				<div class="mx-1">{pageNum}</div>
				<div>]</div></button
			>
		</div>
	{/each}
	<button
		class="inline-flex justify-self-center font-mono text-xl font-medium"
		on:click={() => changePage(currentPage + 1)}
	>
		{'>'}
	</button>
</div>
