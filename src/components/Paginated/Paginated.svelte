<script lang="ts">
	import HeroiconsArrowUpRight from '~icons/heroicons/arrow-up-right';
	import { currentPage, totalPages } from '$lib/stores';
	import { paginate, formatIndex } from '@components/Paginated/utils';
	import { search } from './utils';
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

	$: pagedFollowing = paginate(following);
	$: query = '';

	$: accStates = paginate(following).map((page) =>
		Array(page.length).fill(false)
	);

	function toggleSingle(pageIndex: number, broadcasterIndex: number) {

		accStates[pageIndex][broadcasterIndex] =
			!accStates[pageIndex][broadcasterIndex];
		accStates = [...accStates];
	}

	function toggleAll(newState: boolean = false) {
		accStates = pagedFollowing.map((page) =>
			Array(page.length).fill(newState)
		);
	}

	function handleSearch(q: string) {
		const searchResult = search(following, q);
		setFilter(null, searchResult);
	}

	let filter = false;
	function setFilter(
		event: MouseEvent | null,
		haystack: FollowsData[] | null = null
	) {
		if (!event && haystack) {
			changePage(0);
			pagedFollowing = paginate(haystack);
			pagedFollowing = [...pagedFollowing];

			toggleAll();
			return;
		} else if (event) {
			const targetId = (event.currentTarget as HTMLElement).id;
			const filterBuffer = filter;
			filter = targetId === 'following' ? false : true;

			// dont bother running compute if the filter hasn't changed
			if (filterBuffer === filter && haystack === following) {
				return;
			}

			changePage(0);
			query = '';
			if (filter) {
				const res = following
					.map((broadcaster) => {
						if (subscribed(broadcaster.broadcaster_name)) {
							return broadcaster;
						}
					})
					.filter(Boolean);

				pagedFollowing = paginate(res as FollowsData[]);
				pagedFollowing = [...pagedFollowing];

				toggleAll();
			} else {
				pagedFollowing = paginate(following);
				pagedFollowing = [...pagedFollowing];

				toggleAll();
			}
		}
	}

	function getSubscriptionDetails(broadcaster: string) {
		const res = subscriptions.map((sub) => {
			if (sub.broadcaster_name === broadcaster) {
				return sub;
			}
		});

		return res;
	}

	type DurationUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes';
	function followAge(date: string): string {
		// correctly types the way we index `duration` with a year
		const getDurationValue = (
			duration: Duration,
			unit: DurationUnit
		): number => {
			return duration[unit]();
		};
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

	function changePage(num: number) {
		if (num >= pagedFollowing.length || num < 0 || num === $currentPage)
			return;

		currentPage.set(num);
		return;
	}
</script>

{#key $totalPages}
	<div class="my-10 flex w-1/2 flex-row items-center justify-center">
		<PageNums currentPage={$currentPage} {changePage} />
	</div>
{/key}

<div class="items-around mt-4 flex w-1/2 flex-row justify-around">
	<button
		id="following"
		on:click={(event) => setFilter(event)}
		class={`flex flex-col items-center justify-center transition-all duration-200 ${!filter ? 'cursor-default' : 'text-gray-400 hover:brightness-75'}`}
	>
		<span class="font-bold">following</span>
		<span class="text-sm italic text-gray-500"
			>({following.length} channels)</span
		>
	</button>
	<button
		on:click={(event) => setFilter(event)}
		id="subscriptions"
		class={`flex flex-col items-center justify-center transition-all duration-200 ${filter ? 'cursor-default' : 'text-gray-400 hover:brightness-75'}`}
	>
		<span class="font-bold">subscribed</span>
		<span class="text-sm italic text-gray-500"
			>({subscriptions.length} channels)</span
		>
	</button>
</div>
<div
	class="mr-4 mt-8 flex w-4/5 flex-row items-center justify-between text-sm font-medium"
>
	<div class="flex flex-col">
		<button
			on:click={() => toggleAll(false)}
			class="flex w-full flex-row transition-all duration-200 hover:brightness-50"
		>
			<div class="mr-2 font-mono text-gray-400">[-]</div>
			<div class="text-gray-400">Collapse all</div>
		</button>

		<button
			on:click={() => toggleAll(true)}
			class="flex w-full flex-row transition-all duration-200 hover:brightness-50"
		>
			<div class="mr-2 font-mono text-gray-400">[+]</div>
			<div class="text-gray-400">Expand all</div>
		</button>

		<div class="mt-8">
			<input
				type="text"
				placeholder="search"
				class="rounded-lg border border-gray-500 px-2 py-px"
				bind:value={query}
				on:input={() => handleSearch(query)}
			/>
		</div>
	</div>
</div>

{#each pagedFollowing as page, pIndex}
	{#if pIndex === $currentPage}
		<div class="mt-4 w-full">
			{#each page as broadcaster, bIndex}
				{#if isPlaceholder(broadcaster)}
					<!--
                        keep page numbers below the list of followed
                        users in a consisten location
                    -->
					<AccordionBlank index={bIndex} />
				{:else}
					<AccordionList
						open={accStates[pIndex][bIndex]}
						index={bIndex}
						toggle={() => toggleSingle(pIndex, bIndex)}
					>
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
								class="mr-4 flex w-full flex-row items-center justify-end text-end font-semibold"
							>
								{broadcaster.broadcaster_name}
								{#if subscribed(broadcaster.broadcaster_name)}
									<div
										class="ml-2 inline-flex flex-row font-mono text-xs text-blue-600"
									>
										[**]
									</div>
								{:else}
									<div
										class="invisible ml-2 inline-flex flex-row items-center justify-items-center font-mono text-xs"
									>
										[**]
									</div>
								{/if}
							</div>
						</div>
						<div slot="details">
							<div class="flex w-full flex-row justify-around">
								<div class="flex flex-col">
									Following for {followAge(
										broadcaster.followed_at
									)}

									<div class="italic text-gray-500">
										(since <span class="font-medium"
											>{new Date(
												broadcaster.followed_at
											).toLocaleString()}</span
										>)
									</div>
									{#if subscribed(broadcaster.broadcaster_name)}
										<div>
											{#each getSubscriptionDetails(broadcaster.broadcaster_name) as subscription}
												{#if subscription}
													<div
														class="mt-4 flex flex-col"
													>
														<div
															class="flex flex-row"
														>
															<div>
																Subscribed at
																Tier
															</div>
															<div class="ml-1">
																{' '}{subscription
																	.tier[0]}
															</div>
														</div>
														{#if subscription.is_gift}
															<div
																class="italic text-gray-500"
															>
																(A gift from <a
																	href={`https://www.twitch.tv/${subscription.gifter_login}`}
																	class="font-medium text-blue-400 underline transition-all duration-200 hover:brightness-50"
																	target="_blank"
																	referrerpolicy="no-referrer"
																	>@{subscription.gifter_login}</a
																>)
															</div>
														{/if}
													</div>
												{/if}
											{/each}
										</div>
									{/if}
								</div>
								<div>
									<span
										class="h-full justify-end text-lg font-semibold"
									>
										<a
											href={`https://www.twitch.tv/${broadcaster.broadcaster_login}`}
											class="flex flex-row text-[#a970ff] brightness-90 transition-all duration-200 hover:opacity-55"
											target="_blank"
											referrerpolicy="no-referrer"
										>
											<div>
												/{broadcaster.broadcaster_name}
											</div>
											<HeroiconsArrowUpRight
												style="font-size: 10px; margin-left: 4px; margin-top: 2px"
											/>
										</a>
									</span>
								</div>
							</div>
						</div>
					</AccordionList>
				{/if}
			{/each}
		</div>
	{/if}
{/each}
