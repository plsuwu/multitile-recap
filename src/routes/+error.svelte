<script lang="ts">
	import { page } from '$app/stores';
	const err = $page.error?.message;

</script>

{#if err}
	<div class="flex h-screen w-full flex-row items-center justify-center">
		<div class="flex flex-col items-center space-y-6">
			<div>error processing previous request:</div>
			<div class="text-3xl font-semibold text-red-700">{err}</div>
			<a
				href="/"
				class="mt-14 transition-opacity duration-100 hover:opacity-55"
				>{'<-'} home</a
			>
		</div>
	</div>
{/if}
