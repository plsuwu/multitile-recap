<script lang="ts">
	import type { RecapsQueryResponse } from '$lib/types';
	export let recaps: RecapsQueryResponse[];
	export let updateFilter: (channel: string) => void;
	export let filtered: (string | undefined)[];
	export let open: boolean;
	export let toggleModal: (
		event: MouseEvent | null,
		keyboardEvent?: boolean
	) => void;
	export let increaseGridsize: () => void;
	export let decreaseGridsize: () => void;

	let channels = recaps.map((recap: any) => recap.data.channel.displayName);
</script>

<div
	tabindex="0"
	on:click={toggleModal}
	role="button"
	on:keypress={(event) => {
		// idk or care tbh
		// ill figure it out anotyhe rttimne idk what im doing wrong
		event.preventDefault();
		if (event.key === 'Escape') {
			toggleModal(null, true);
		}
	}}
	class={`left-0 top-0 h-screen w-screen bg-black/65 ${open ? 'fixed' : 'hidden'} px-24 `}
>
	<div
		class="flex w-1/4 cursor-default flex-col bg-white p-4"
		role="menu"
		tabindex="0"
		on:keypress={(event) => {
			console.log(event.key);
			if (event.key === 'Escape') {
				toggleModal(null, true);
			}
		}}
	>
		{#each channels as channel}
			<button
				class="flex flex-row items-center justify-start text-start transition-opacity duration-100 hover:opacity-55"
				on:click={() => updateFilter(channel)}
				><div
					class={`mx-2 font-mono ${filtered.includes(channel) ? 'text-green-300' : 'text-red-400'}`}
				>
					{filtered.includes(channel) ? '[+]' : '[-]'}
				</div>
				{channel}
			</button>
		{/each}

		<div
			class="mx-2 my-4 flex flex-row items-center justify-start space-x-4"
		>
			<button
				class="font-mono transition-opacity duration-100 hover:opacity-55"
				on:click={decreaseGridsize}>[-]</button
			>
			<div>decrease/increase COLUMNxROW count</div>
			<button
				class="font-mono transition-opacity duration-100 hover:opacity-55"
				on:click={increaseGridsize}>[+]</button
			>
		</div>
	</div>
</div>
