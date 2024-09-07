<script lang="ts">
    import { page } from '$app/stores';
    import Accordion from '@/components/Accordion.svelte';
	import HLink from '@/components/HLink.svelte';
</script>

<div class='self-start mt-24 mx-56 flex-shrink'>
    <HLink href={'/'} text={'<- return'} />
</div>

<div class='flex flex-col justify-center flex-1'>
    <Accordion subs={$page.data.subs} follows={$page.data.follows} />
</div>
