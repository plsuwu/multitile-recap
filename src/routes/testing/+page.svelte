<script lang="ts">
	import Divider from '$components/divider/Divider.svelte';
	import SearchTest from '$components/search-test/SearchTest.svelte';
	import SyncStatus from '$components/sync-status/SyncStatus.svelte';
	import type { TwitchUser, UserSelect } from '$types';

	let { data }: { data: { user: TwitchUser } } = $props();
	let { user } = data;

	async function handleSearch(q: string): Promise<{ results: UserSelect[] }> {
		const response = await fetch(`/api/data/searcht?q=${q}`, {
			method: 'GET',
		});

		const body = await response.json();
		console.log(body);
		return body;
	}

	let query = $state('');
	let buff = $state('');
	let results: UserSelect[] | null = $state(null);

	$effect(() => {
		if (buff !== query) {
			buff = query;
			setTimeout(() => {
				if (buff !== query) {
					if (query === '') {
						buff = query;
						results = null;
					} else {
						setTimeout(() => {
							buff = query;
							handleSearch(query).then((r) => {
								results = r.results;
							});
						}, 100);
					}
				}

				if (query === '') {
					results = null;
				} else {
					handleSearch(query).then((r: any) => {
						results = r.results;
					});
				}

				console.log(results);
			});
		}
	});
</script>

<div class="my-12">
	<form method="POST" class="flex flex-col" action="?/enqueue">
		<button>test '/api/data/enqueue'</button>
	</form>
	<form method="POST" class="flex flex-col" action="?/status">
		<button>test '/api/data/status'</button>
	</form>
</div>
<SyncStatus {user} />
<SearchTest bind:query />

{#if results}
	<div class="my-8 w-1/3 self-center rounded-md border">
		{#key results}
			{#each results as r, i}
				<div class="mx-8 my-8">
					<div class="flex flex-row">
						<div class="flex flex-col">
							<div class="text-xs">{r.id}</div>
							<div class="font-bold">{r.login}</div>
						</div>
						<img
							src={r.profile_image_url}
							alt={`${r.login} profile image`}
							class="mx-6 size-12 rounded-lg"
						/>
					</div>
					<p class="pt-4 text-sm italic text-gray-500">
						"{r.description}"
					</p>
				</div>
				{#if results[i].id !== results[results.length - 1].id}
					<Divider />
				{/if}
			{/each}
		{/key}
	</div>
{/if}
