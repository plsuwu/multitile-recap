<script lang="ts">
	import Nav from '$components/nav/Nav.svelte';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import type { PageData } from './$types';

	let { children, data }: { children: Snippet, data: PageData } = $props();
    let { user } = $state(data);


    $inspect(user);

</script>

<div class="flex min-h-screen flex-col">
    {#key user}
	<div class="flex flex-col justify-center items-center">
		<Nav {user} />
	</div>
    {/key}

	<div class="flex flex-1 flex-col items-center justify-center">
		{@render children()}
	</div>
</div>
