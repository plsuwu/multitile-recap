<script lang="ts">
	import { currentPage } from '$lib/stores';
	import { paginate, formatIndex } from '@components/Paginated/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import type { FollowsData, UserSubscriptions } from '$lib/types';
	import PageNums from '@components/Paginated/PageNums.svelte';
	import AccordionList from '@components/Accordion/AccordionList.svelte';
	import AccordionBlank from '@components/Accordion/AccordionBlank.svelte';

	dayjs.extend(duration);
	dayjs.extend(relativeTime);

	export let following: FollowsData[];
	export let subscriptions: UserSubscriptions[];

	function followAge(date: string) {
		const followed = dayjs(date);
		const curr = dayjs();

		const diff = curr.diff(followed);
		const duration = dayjs.duration(diff);

		const mins = duration.minutes();
		const hours = duration.hours();
		const days = duration.days();
		const months = duration.months();
		const years = duration.years();

		if (years > 0) {
			return `${years} years, ${months} months, ${days} days, ${hours} hours, ${mins} minutes`;
		} else if (months > 0) {
			return `${months} months, ${days} days, ${hours} hours, ${mins} minutes`;
		} else if (days > 0) {
			return `${days} days, ${hours} hours, ${mins} minutes`;
		} else if (hours > 0) {
			return `${hours} hours, ${mins} minutes`;
		} else {
			return `${mins} minutes`;
		}
	}

	function subscribed(b: string) {
		return subscriptions.some((i) => i.broadcaster_name === b);
	}

	function isPlaceholder(b: FollowsData): boolean {
		return Object.values(b).every((val) => val === '');
	}

	function getBrIndex(br: FollowsData) {
		return following.indexOf(br);
	}

	const pagedFollowing = paginate(following);
	$: open = false;

	function changePage(num: number) {
		if (num >= pagedFollowing.length || num < 0 || num === $currentPage)
			return;

		currentPage.set(num);
		return;
	}
</script>

<div class="my-10 flex w-1/2 flex-row items-center justify-center">
	<PageNums
		currentPage={$currentPage}
		totalPages={pagedFollowing.length}
		{changePage}
	/>
</div>

{#each pagedFollowing as page, pIndex}
	{#if pIndex === $currentPage}
		<div class="my-20 w-full">
			{#each page as broadcaster, bIndex}
				{#if isPlaceholder(broadcaster)}
					<!--
                        keep page numbers below the list of followed
                        users in a consisten location
                    -->
					<AccordionBlank index={bIndex} />
				{:else}
					<AccordionList {open} index={bIndex}>
						<div
							class="flex w-full flex-row items-start px-4 py-px"
							slot="title"
						>
							<div
								class="w-full justify-start text-start font-mono"
							>
								{formatIndex(
									getBrIndex(broadcaster),
									following.length
								)}
							</div>
							<div
								class="mr-4 w-full text-end font-semibold italic"
							>
								{broadcaster.broadcaster_name}
								{#if subscribed(broadcaster.broadcaster_name)}
									<div
										class="inline-flex flex-row font-mono text-xs text-blue-600"
									>
										[**]
									</div>
								{:else}
									<div
										class="invisible inline-flex flex-row items-center justify-items-center font-mono text-xs"
									>
										[**]
									</div>
								{/if}
							</div>
						</div>
						<div slot="details">
							Following for {followAge(broadcaster.followed_at)}

							<div>
								(since {new Date(
									broadcaster.followed_at
								).toLocaleString()})
							</div>
						</div>
					</AccordionList>
				{/if}
			{/each}
		</div>
	{/if}
{/each}
