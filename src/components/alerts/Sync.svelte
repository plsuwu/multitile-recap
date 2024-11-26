<script lang="ts">
	import type { AlertProps } from '$types/components/alert';
	import { slide } from 'svelte/transition';
	let {
		status,
		handleDismiss,
		index,
	}: { status: AlertProps; handleDismiss: () => void; index: number } =
		$props();

	function truncate(str: string) {
		if (str.length < 50) {
			return str;
		}

		let res = str.slice(0, 50);
		res += '...';

		return res;
	}
</script>

{#key index}
	<button
		class={`group mx-8 w-[250px] min-w-[250px] items-start rounded-md border border-blue-900 bg-blue-50 py-4 hover:border-blue-400`}
		onclick={handleDismiss}
		transition:slide
	>
		<div
			class="mx-6 mb-1 flex flex-col items-start justify-start justify-items-start self-start"
		>
			<div
				class="mb-2 flex w-full flex-row items-center justify-between justify-items-center"
			>
				<div class="font-bold text-blue-900">
					<!-- {error.title} -->
					Sync
				</div>
				<div
					class="flex items-start self-start transition-all duration-200 ease-in-out group-hover:opacity-25"
				>
					x
				</div>
			</div>
			<div class="w-full items-start justify-start self-start text-start">
				<p class="break-all text-xs text-blue-800">
					{truncate(status.message)}
				</p>
			</div>
		</div>
	</button>
{/key}
