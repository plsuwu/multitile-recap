<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';
	import { setAlertState } from '$components/alerts/state.svelte';

	import Nav from '$components/nav/Nav.svelte';
	import Alerter from '$components/alerts/Alerter.svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let { user } = $state(data);

	setAlertState();
</script>

<div class="flex min-h-screen flex-col">
    <div class='w-full flex flex-col'>
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
