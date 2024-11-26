<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center p-14 border rounded-md">
	<div class="mb-4 text-gray-700">
		this server was unable to process your request due to an error:
	</div>
	<div class="flex flex-col items-center">
		<div>
			received a response with a <span class="font-semibold text-red-700"
				>{$page.status}</span
			>
			<span class="text-red-700"
				>({$page.error?.message.toLowerCase()})</span
			>
			status code.
		</div>
	</div>
</div>

<div>
    <a href='/' class='underline hover:opacity-55 duration-200 ease-in-out transition-all items-center'>{'<'} return to index page</a>
</div>
