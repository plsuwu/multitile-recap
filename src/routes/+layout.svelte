<script lang="ts">
	import '../app.css';
	import type { PageData } from './$types';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { browser } from '$app/environment';

	import {
		setAlertState,
		getAlertState,
	} from '$components/alerts/state.svelte';
	import Nav from '$components/nav/Nav.svelte';
	import Alerter from '$components/alerts/Alerter.svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let { user } = $state(data);

	setAlertState();
	const alerts = $state(getAlertState());
	let eventSource: EventSource | undefined = $state(undefined);

	const openEventSource = async () => {
		eventSource!.onmessage = (event) => {
			console.log('E->  ', event);
			let data = pollSource(event);
			if (data.status !== 'completed') {
				console.log(data);
				data = pollSource(event);
			}
		};
	};

	function pollSource(event: MessageEvent<any>) {
		const { type, data } = JSON.parse(event.data);
		if (type === 'sync-status' && user) {
			alerts.add(data.type, data.message, user.id);

			return { ...data };
		}
	}

	onMount(() => {
        eventSource = new EventSource(`/api/data/status/${user?.id}`)
	});

    onDestroy(() => {
        if (eventSource) {
            console.log('closing esource');
            eventSource.close();
        }
    });

	$effect(() => {
        $inspect(eventSource);
		openEventSource();
	});
</script>

<div class="flex min-h-screen flex-col">
	<div class="flex w-full flex-col">
		<Alerter />
	</div>

	{#key user}
		<div class="flex flex-col items-center justify-center">
			<Nav {user} />
		</div>
	{/key}

	<div class="flex h-full flex-1 flex-col items-center">
		{@render children()}
	</div>
</div>
