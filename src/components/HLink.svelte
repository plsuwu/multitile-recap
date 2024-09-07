<script lang="ts">
	import { Button } from '@/components/ui/button/index';
	export let href: string;
	export let text: string;
</script>

<div>
	<Button
		variant="link"
		class="text-lg flex flex-row"
		{href}
	>
		<div>[</div>
		<span class="text-sm mt-1">{text}</span>
		<div>]</div>
	</Button>
</div>
