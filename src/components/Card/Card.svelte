<script lang="ts">
	import type { RecapsQueryResponse } from '$lib/types';
	import CardContainer from './CardContainer.svelte';
	import CardContent from './CardContent.svelte';

	export let recap: RecapsQueryResponse;
	export let displayName: string;
</script>

<CardContainer>
	<CardContent {recap} {displayName} />
</CardContainer>
