<script lang="ts">
	export let imageUrl: string;
	export let open: boolean;
	export let toggleModal: () => void;
</script>

<div
	tabindex="0"
	on:click={toggleModal}
	role="button"
	on:keypress={() => {
		return null;
	}}
	class={`left-0 top-0 h-screen w-screen bg-black/65 ${open ? 'fixed' : 'hidden'} flex flex-row items-center justify-center p-24`}
>
	<img src={imageUrl} alt="modal" class="rounded-md shadow-xl" />
</div>
