<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

   let { data } = $props();

   onMount(() => {
       invalidateAll();
       window.location.href = '/';
    });
</script>
