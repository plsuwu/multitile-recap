<script lang="ts">
	import { currentPage } from '$lib/stores';
	import { paginate, formatIndex } from '@components/Paginated/utils';
	import dayjs from 'dayjs';
	import duration, { type Duration } from 'dayjs/plugin/duration';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import type { FollowsData, UserSubscriptions } from '$lib/types';
	import PageNums from '@components/Paginated/PageNums.svelte';
	import AccordionList from '@components/Accordion/AccordionList.svelte';
	import AccordionBlank from '@components/Accordion/AccordionBlank.svelte';

	dayjs.extend(duration);
	dayjs.extend(relativeTime);

	export let following: FollowsData[];
	export let subscriptions: UserSubscriptions[];

	type DurationUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes';
	function followAge(date: string): string {

        // correctly types the way we index `duration` with a year
	    const getDurationValue = (duration: Duration, unit: DurationUnit): number => {
	    	return duration[unit]();
	    }
		const duration = dayjs.duration(dayjs().diff(dayjs(date)));
		const units: DurationUnit[] = [
			'years',
			'months',
			'days',
			'hours',
			'minutes',
		];

		for (const unit of units) {
			const value = getDurationValue(duration, unit);
			if (value > 0) {
				return units
					.slice(units.indexOf(unit))
					.map((u) => {
						const val = getDurationValue(duration, u);
						return val > 0 ?
								`${val} ${u.slice(0, -1)}${val !== 1 ? 's' : ''}`
							:	null;
					})
					.filter(Boolean)
					.join(', ');
			}
		}

		return 'less than a minute';
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
