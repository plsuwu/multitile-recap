<script lang="ts">
	import { getAlertState } from './state.svelte';
	import Error from './Error.svelte';
	import Sync from './Sync.svelte';

	const alertState = getAlertState();
	function handleDismiss(alertId: string) {
		alertState.remove(alertId);
	}
</script>

<div
	class="absolute mt-10 flex flex-col items-center justify-self-end transition-all duration-1000 ease-in-out"
>
	{#each alertState.alerts as alert, index}
		{#key index}
			<div
				class={`absolute flex w-full flex-col items-start justify-self-end transition-all duration-200`}
				style={`margin-top: ${30 * index}px; transition: margin-top 1s ease-in-out;`}
			>
				{#if alert.alertType === 'error'}
					<Error
						error={alert}
						handleDismiss={() => handleDismiss(alert.id)}
						{index}
					/>
				{:else}
					<Sync
						status={alert}
						handleDismiss={() => handleDismiss(alert.id)}
						{index}
					/>
				{/if}
			</div>
		{/key}
	{/each}
</div>
