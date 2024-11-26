<script lang="ts">
	import type { TwitchUser } from '$types';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import JobData from './JobData.svelte';
	import Divider from '$components/divider/Divider.svelte';

	type QueueStatus = {
		followed: {
			complete: number;
			total: number;
			status: string;
			message: string;
			color: string;
		};
		subscribed: {
			complete: number;
			total: number;
			status: string;
			message: string;
			color: string;
		};
		badges: {
			complete: number;
			total: number;
			status: string;
			message: string;
			color: string;
		};
		all: {
			complete: number;
			total: number;
			status: string;
			message: string;
		};
	};

	const EMPTY = {
		complete: 0,
		total: 0,
		status: '',
		message: '',
		color: '#000000',
	};

	let { user }: { user: TwitchUser } = $props();
	let status: QueueStatus = $state({
		followed: EMPTY,
		subscribed: EMPTY,
		badges: EMPTY,
		all: {
            complete: 0,
            total: 0,
            status: '',
            message: '',
		},
	});

	let loaderWidth = $state({ f: 0, s: 0, b: 0 });

	async function pollJobUpdates() {
		const response = await fetch(`/api/data/status/${user.id}`, {
			method: 'GET',
		});

		const body = await response.json();
        // console.log(body);

		const followedStatus = body.followed;
		const subscribedStatus = body.subscribed;
		const badgesStatus = body.badges;

		if (followedStatus) {
			loaderWidth.f =
				(followedStatus.complete / followedStatus.total) * 100;
		}
		if (subscribedStatus) {
			loaderWidth.s =
				(subscribedStatus.complete / subscribedStatus.total) * 100;
		}
		if (badgesStatus) {
			loaderWidth.b = (badgesStatus.complete / badgesStatus.total) * 100;
		}

        if (followedStatus.status === 'completed' && subscribedStatus.status === 'completed') {
            setTimeout(async () => {
			    await pollJobUpdates();
            }, 100);
		}
	}
	onMount(() => {
		pollJobUpdates();
	});
</script>

<div
	class="m-5 flex flex-col items-center justify-center self-center rounded-lg border p-6"
>
	<div>
		sync jobs for <span class="font-semibold">{user.display_name}</span>
		[<span class="text-xs italic text-gray-400">{user.id}</span>]:
	</div>
	{#if loaderWidth.f > 0}
		{#key loaderWidth.f === 0}
			<div
				class="mt-1 flex flex-row self-start py-px"
				style={`width: ${loaderWidth.f}%; background-color: ${user.color}`}
			></div>
		{/key}
	{:else}
		<div class="mt-1 py-px" style={`width: 100%; opacity: 0%;`}></div>
	{/if}
	{#if loaderWidth.s > 0}
		{#key loaderWidth.s === 0}
			<div
				class="flex flex-row self-start py-px"
				style={`width: ${loaderWidth.s}%; background-color: ${user.color}; opacity: 65%;`}
			></div>
		{/key}
	{:else}
		<div class="py-px" style={`width: 100%; opacity: 0%;`}></div>
	{/if}
	{#if loaderWidth.b > 0}
		{#key loaderWidth.b === 0}
			<div
				class="flex flex-row self-start py-px"
				style={`width: ${loaderWidth.b}%; background-color: ${user.color}; opacity: 35%;`}
			></div>
		{/key}
	{:else}
		<div class="py-px" style={`width: 100%; opacity: 0%;`}></div>
	{/if}
    <Divider classes='mb-4 mt-1' />
	<div class="flex flex-col self-start text-sm w-full">
		<JobData jobData={status.followed} />
		<Divider classes='my-4' />
		<JobData jobData={status.subscribed} />
		<Divider classes='my-4' />
		<JobData jobData={status.badges} />
	</div>
</div>
