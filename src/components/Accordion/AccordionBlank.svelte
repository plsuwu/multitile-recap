<script lang="ts">
	import { slide } from 'svelte/transition';
	export let open: boolean = false;
	export let index: number;
</script>

<div class="invisible my-0.5 flex w-full flex-col">
	<div class="w-8/12 items-center self-center">
		<div
			class={`flex w-full flex-row items-center self-center rounded-md border border-black/25 font-semibold transition-all duration-200 hover:brightness-50 ${index % 2 === 0 ? 'bg-gray-400/50' : 'hover:bg-gray-400/50'}`}
		>
			<div class="flex w-full justify-between">
				<div class="flex w-full flex-row items-start px-4 py-px">
					<div class="w-full justify-start text-start font-mono">
						0
					</div>
					<div
						class="mr-4 w-full text-end font-semibold italic xl:w-1/2"
					>
						0
					</div>
				</div>

				<div class=" flex flex-row align-middle font-mono">0</div>
			</div>
		</div>
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
