<script lang="ts">
	import { page } from '$app/stores';
	import type { RecapsQueryResponse } from '$lib/types';
	import Card from '@components/Card/Card.svelte';
	import Modal from '@components/Modal/Modal.svelte';

	const recaps = $page.data.recaps;
	let filtered: (string | undefined)[] = [];
	let usingRecaps: RecapsQueryResponse[] = recaps
		.map((recap: any) => {
			if (recap.data.user.self.recap.minutesWatched !== '0') {
				return recap;
			} else {
				filtered.push(recap.data.channel.displayName);
			}
		})
		.filter(Boolean) as RecapsQueryResponse[];

	const getRowData = () => {
		return Math.ceil(usingRecaps.length / userRows);
	};

	$: userRows = 3;
	$: rows = getRowData();
	let open = false;

	const updateFilter = (channel: string) => {
		if (filtered.includes(channel)) {
			const idx = filtered.indexOf(channel);
			filtered = filtered.toSpliced(idx, 1);
		} else {
			filtered.push(channel);
		}

		filtered = filtered;
		updateRecaps();
	};

	const toggleModal = (
		event: MouseEvent | null = null,
		keyboardEvent: boolean = false
	) => {
		if (event && event.target !== event.currentTarget && !keyboardEvent) {
			return;
		}

		open = open ? false : true;
	};

	const increaseGridsize = () => {
		userRows = userRows + 1;
		rows = getRowData();
	};

	const decreaseGridsize = () => {
		userRows = userRows - 1;
		rows = getRowData();
	};

	const updateRecaps = () => {
		usingRecaps = recaps
			.map((recap: any) => {
				if (!filtered.includes(recap.data.channel.displayName)) {
					return recap;
				}
			})
			.filter(Boolean);

		rows = getRowData();
	};
</script>

<Modal
	{open}
	{recaps}
	{filtered}
	{updateFilter}
	{toggleModal}
	{increaseGridsize}
	{decreaseGridsize}
/>
<div class="flex flex-col">
	<div class="my-6 flex w-full flex-row justify-center">
		<div class="inline-flex w-1/3 justify-around justify-self-center">
			<a
				href="/"
				class="self-start transition-opacity duration-100 hover:opacity-55"
			>
				{'<-'} back
			</a>
			<button
				class="self-end italic opacity-55 transition-opacity duration-100 hover:opacity-100"
				on:click={toggleModal}>options</button
			>
		</div>
	</div>
	<div class="flex w-full flex-col">
		{#key usingRecaps || userRows}
			{#each Array(rows) as _, rowIdx}
				<div class="flex w-full flex-row">
					{#each usingRecaps.slice(rowIdx * userRows, (rowIdx + 1) * userRows) as recap}
						<div
							class="flex w-full flex-1 justify-around justify-self-end bg-gradient-to-t from-[#facdc8] via-[#bf94ff] via-[#fab4ff] to-[#a3c1ff] px-[20px] py-[20px] text-[#efeff1]"
						>
							<Card {recap} />
						</div>
					{/each}
				</div>
			{/each}
		{/key}
	</div>
</div>
