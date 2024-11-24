<script lang="ts">
	import Dropdown from './dropdown/Dropdown.svelte';

	let { user } = $props();
	let toggled = $state(false);

	function dismissDropdown(node: HTMLElement) {
		function handleClick(event: MouseEvent) {
			if (!event.composedPath().includes(node)) {
				toggled = false;
			}
		}
		document.addEventListener('click', handleClick);
		return {
			destroy() {
				document.removeEventListener('click', handleClick);
			},
		};
	}

	function toggleDropdown() {
		toggled = !toggled;
	}
</script>

<div class="flex w-full flex-row items-center border-b px-10 text-xs">
	<a href="/" class="group m-1 min-w-8 rounded-md border p-0.5 text-center">
		<div
			class="group px-2 transition-all duration-300 ease-out group-hover:bg-gray-200/90"
		>
			~
		</div>
	</a>

	<div
		class="flex w-full flex-row items-center justify-end"
		use:dismissDropdown
	>
		<button
			onclick={toggleDropdown}
			class="group m-1 min-w-8 rounded-md border p-0.5 text-center"
		>
			<div
				class="group px-2 transition-all duration-300 ease-out group-hover:bg-gray-200/90"
			>
				#
			</div>
		</button>
		<div
			class="absolute mt-10 flex w-full flex-col items-end justify-self-end"
		>
			{#if toggled}
				<Dropdown {user} parentFn={toggleDropdown} />
			{/if}
		</div>
	</div>
</div>
