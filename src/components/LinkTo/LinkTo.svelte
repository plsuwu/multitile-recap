<script lang="ts">
	import { navigating, page } from '$app/stores';
    import { loading } from '$lib/stores';
    import { BarLoader} from 'svelte-loading-spinners';


	export let href: string;
	export let text: string;
    export let targetBlank: boolean = false;

</script>

{#key $page}
    {#if $navigating}
        <BarLoader />
    {:else}
<a
	{href}
	target={targetBlank ? "_blank" : "_self"}
	referrerpolicy="no-referrer"
	class="transition-opacity duration-100 hover:opacity-55"
>
	{text}
</a>
{/if}
{/key}
