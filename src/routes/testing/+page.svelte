<script lang="ts">
	import Divider from '$components/divider/Divider.svelte';
	import SearchTest from '$components/search-test/SearchTest.svelte';
	import SyncStatus from '$components/sync-status/SyncStatus.svelte';
	import type { TwitchUser, UserSelect } from '$types';

	import { getAlertState } from '$components/alerts/state.svelte';
	const alertState = getAlertState();

	function genRandString(len: number = 75) {
		const alphan = 'abcdefghijklmnopqrstuvwxyz1234567890';

		const res = new Array(len);
		for (let i = 0; i < len; ++i) {
			res.push(alphan.charAt(Math.floor(Math.random() * alphan.length)));
		}

		return res.join('');
	}

	let message = $state(genRandString());
	let status: number | undefined = $state(500);
	let alertType: 'error' | 'sync' = $state('sync');
	let titleInput = $state<HTMLInputElement>();

	let { data }: { data: { user: TwitchUser } } = $props();
	let { user } = data;

	let waiting = $state(false);

	async function handleSearch(q: string): Promise<{ results: UserSelect[] }> {
		const response = await fetch(`/api/data/searcht?q=${q}`, {
			method: 'GET',
		});

		const body = await response.json();
		// console.log(body);
		return body;
	}

	let query = $state('');
	let buff = $state('');
	let results: UserSelect[] | null = $state(null);

	$effect(() => {
		if (buff !== query) {
			waiting = true;
			buff = query;
			setTimeout(() => {
				if (buff !== query) {
					if (query === '') {
						buff = query;
						results = null;
						waiting = false;
					} else {
						setTimeout(() => {
							buff = query;
							handleSearch(query).then((r) => {
								results = r.results;
								waiting = false;
							});
						}, 100);
					}
				}

				if (query === '') {
					results = null;
					waiting = false;
				} else {
					handleSearch(query).then((r: any) => {
						results = r.results;
						waiting = false;
					});
				}

				console.log(results);
			});
		}
	});
</script>

<div class="my-12">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			alertState.add(alertType, message, status || 500);
			message = genRandString();
			status = 500;

			titleInput?.focus();
		}}
		method="POST"
		class="flex flex-col space-y-1 text-xs placeholder:text-xs"
		action="?/trigger_alert"
	>
		<label for="alert-type">type</label>
		<select
			id="alert-type"
			class="rounded-md border p-1"
			bind:value={alertType}
		>
			<option> error </option>
			<option> sync </option>
		</select>
		<label for="message">message</label>
		<input
			type="text"
			class="rounded-md border p-1"
			id="message"
			bind:value={message}
		/>
		<label for="status">status</label>
		<input
			type="text"
			class="rounded-md border p-1"
			id="status"
			bind:value={status}
		/>
		<button>test</button>
	</form>
</div>
<div class="mb-12">
	<form method="POST" class="flex flex-col" action="?/enqueue">
		<button>test '/api/data/enqueue'</button>
	</form>
	<form method="POST" class="flex flex-col" action="?/status">
		<button>test '/api/data/status'</button>
	</form>
</div>

<SyncStatus {user} />
<SearchTest bind:query />

{#if results && results.length > 0}
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
{:else if query !== '' && !waiting}
	<div class="my-8 w-1/3 self-center rounded-md border text-center">
		<div class="p-4">
			no results for query <span class="font-medium italic text-gray-500"
				>'{query}'</span
			>
		</div>
	</div>
{/if}
