<script lang="ts">
    import * as Alert from "@/components/ui/alert/index";

	export let why: string;
	export let where: string;
</script>

<div
	class="bg-red-200 w-full flex flex-row items-center justify-center py-1">
	<div class="bg-red-950 font-semibold text-red-400 px-1 rounded-md">
		[error]:
	</div>
	<div class="flex flex-row mx-2">
		there was an issue accessing <span class='mx-1 italic'>'{where}'</span>:
		<div class="italic text-gray-500 mx-2">{why}</div>
	</div>
</div>
