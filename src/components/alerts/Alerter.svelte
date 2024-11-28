<script lang="ts">
	import { getAlertState } from './state.svelte';
    import Alert from './Alert.svelte';

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
					<Alert
						{alert}
						handleDismiss={() => handleDismiss(alert.id)}
						{index}
					/>
			</div>
		{/key}
	{/each}
</div>
