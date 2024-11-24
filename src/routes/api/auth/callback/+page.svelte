<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data }: any = $props();
	const { user } = data;

	onMount(() => {
		setTimeout(() => {
			window.location.href = '/';
		}, 1500);
	});
</script>

<div class="flex flex-col items-center justify-center space-y-4">
	<div>omg {user.display_name} hiii</div>
	<div>
		<p>
			you should be redirected back to the index page momentarily; if not,
			click <a href="/" class="underline hover:text-gray-400">here</a>
		</p>
	</div>
</div>
