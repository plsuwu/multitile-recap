<script lang="ts">
	import type { UserSelect } from '$types';

	let { query = $bindable() }: { query: string } = $props();
</script>

<input
	type="text"
	bind:value={query}
	placeholder="search test"
	class="mx-2 mt-0 w-1/4 items-center rounded-md px-1 py-1 text-xs placeholder:items-center"
/>
