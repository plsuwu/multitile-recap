<script lang="ts">
    import type { PageData } from "./$types";
	import { onMount } from "svelte";
    import { getAlertState } from "$components/alerts/state.svelte";

    const { data }: { data: PageData } = $props();
    const { user, sync } = data;

    const syncState = getAlertState();
    let progress: any | undefined = $state(undefined);

    onMount(async () => {
        if (sync && user) {
            progress = await fetch(`/api/data/status/${user.id}`, {
                method: 'GET',
            });

            // syncState.add(
            //     'sync',
            // );
        }
    });
</script>

<div class="h-full font-mono">
	<a
		class="text-blue-600 underline transition-all duration-200 hover:brightness-50"
		href="/testing"
		data-sveltekit-preload-data="off">goto testing page</a
	>
</div>
