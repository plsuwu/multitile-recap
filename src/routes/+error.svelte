<script lang="ts">
	import { page } from '$app/stores';
	const err = $page.error?.message;
</script>

{#if err}
	<div>
		{err}
	</div>
{/if}
