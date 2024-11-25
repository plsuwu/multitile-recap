<script lang="ts">
	import type { TwitchUser } from '$types';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let { user }: { user: TwitchUser } = $props();
	let status = $state({ complete: 0, total: 0, status: '', message: '', color: '#000000' });

    let loaderWidth = $state(0);

	async function pollJobUpdates() {
		const response = await fetch(`/api/data/status/${user.id}`, {
			method: 'GET',
		});

		const body = await response.json();
        status = body;
        loaderWidth = (status.complete / status.total) * 100;

        if (status.complete !== status.total) {
            await pollJobUpdates();
        }

        if (status.complete === status.total) {
            setTimeout(() => {
                loaderWidth = 0;
            }, 3500);
        }
	}
    onMount(() => {
        pollJobUpdates();
    })
</script>

<div
	class="m-5 flex flex-col items-center justify-center self-center rounded-lg border p-6"
>
	<div>
		sync jobs for <span class="font-semibold">{user.display_name}</span>
		[<span class="text-xs italic text-gray-400">{user.id}</span>]:
	</div>
        {#if loaderWidth > 0}
            {#key loaderWidth === 0}
                <div class='py-px mt-1 flex flex-row self-start' style={`width: ${loaderWidth}%; background-color: ${user.color}`}></div>
                <div class='py-px flex flex-row self-start' style={`width: ${loaderWidth}%; background-color: ${user.color}; opacity: 65%;`}></div>
                <div class='py-px flex flex-row self-start' style={`width: ${loaderWidth}%; background-color: ${user.color}; opacity: 35%;`}></div>
            {/key}
        {:else}
            <div class='py-px mt-1' style={`width: 100%; opacity: 0%;`}></div>
            <div class='py-px' style={`width: 100%; opacity: 0%;`}></div>
            <div class='py-px' style={`width: 100%; opacity: 0%;`}></div>
        {/if}
        <div class="mt-6 flex flex-col self-start text-sm">
		<div>
			{status.complete} of {status.total}
		</div>
		<div>
			fetch: '<span class='font-semibold'>{status.message}</span>'
		</div>
        {#if status.complete === status.total}
            <div>(job complete)</div>
        {/if}
	</div>
</div>
