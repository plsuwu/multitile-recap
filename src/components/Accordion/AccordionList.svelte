<script lang="ts">
	import { slide } from 'svelte/transition';
	export let open: boolean;
	export let index: number;

	const toggle = () => {
		open = open ? false : true;
	};
</script>

<div class="my-0.5 flex w-full flex-col">
	<div class="xl:w-8/12 w-full items-center self-center">
		<button
			class={`flex w-full flex-row items-center self-center rounded-md border border-black/25 font-semibold transition-all duration-200 hover:brightness-50 ${index % 2 === 0 ? 'bg-gray-400/50' : 'hover:bg-gray-400/50'}`}
			on:click={toggle}
		>
			<div class="flex w-full justify-between">
				<slot name="title">
                </slot>
				<div class="flex flex-row align-middle font-mono">
					<div>[</div>
					{#if open}
						<div>-</div>
					{:else}
						<div>+</div>
					{/if}
					<div>]</div>
				</div>
			</div>
		</button>
		{#if open}
			<div
				class="mx-2 rounded-bl rounded-br-md border-b border-l border-r border-black/10 bg-black/5"
				transition:slide
			>
				<div class="p-4">
					<slot name="details"></slot>
				</div>
			</div>
		{/if}
	</div>
</div>
