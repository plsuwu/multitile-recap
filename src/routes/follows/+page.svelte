<script lang="ts">
	import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let { user, followed } = data;

    console.log(user, followed);
</script>
