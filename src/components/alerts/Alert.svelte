<script lang="ts">
	import type { AlertProps } from '$types/components/alert';
	import { slide } from 'svelte/transition';
	let {
        alert,
		handleDismiss,
        index,
	}: { alert: AlertProps; handleDismiss: () => void, index: number } = $props();

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
		class={`mx-8 w-[250px] min-w-[250px] items-start rounded-md border py-4 group`}
        class:info={alert.type === 'info'}
        class:success={alert.type === 'success'}
        class:warning={alert.type === 'warning'}
        class:error={alert.type === 'error'}
		onclick={handleDismiss}
        transition:slide
	>
		<div class="mx-6 mb-1 flex flex-col items-start self-start justify-items-start justify-start">
			<div
				class="mb-2 flex w-full flex-row items-center justify-between justify-items-center"
			>
				<div class="font-bold">
                    {alert.title}
				</div>
				<div
					class="flex transition-all duration-200 ease-in-out group-hover:opacity-25 self-start items-start"

				>x</div>
			</div>
			<div class="w-full items-start justify-start self-start text-start">
				<p class="break-all text-xs">
					{truncate(alert.message)}
				</p>
			</div>
		</div>
        </button
	>
{/key}
