<script lang="ts">
	import MdiGithub from '~icons/mdi/github';
	import MdiSoundcloud from '~icons/mdi/soundcloud';
</script>

<div
	class="flex w-full flex-row justify-between space-x-4 bg-gray-400/35 px-4 py-3 text-xs text-gray-500 shadow-inner"
>
	<div class="flex flex-row items-center">
		<a
			href="https://github.com/plsuwu/tiles"
			class="flex flex-row items-center space-x-2 font-semibold hover:brightness-50"
			target="_blank"
			referrerpolicy="no-referrer"
		>
			<div>[</div>
			<div>tiles</div>
			<div>@</div>
			<div><MdiGithub /></div>
			<div>]</div>
		</a>
	</div>
	<div class="flex flex-row items-center space-x-2">
		<a
			href="https://plsuwu.com"
			class="flex flex-row items-center space-x-2 font-semibold hover:brightness-50"
			target="_blank"
			referrerpolicy="no-referrer"
			><div>[</div>
			<div>plsuwu.com</div>
			<div>]</div></a
		>
		<div class="flex flex-row space-x-2 font-semibold">
			<div>[</div>
			<div>plsuwu @:</div>
		</div>
		<a
			href="https://github.com/plsuwu/"
			class="hover:brightness-50"
			target="_blank"
			referrerpolicy="no-referrer"
		>
			<MdiGithub />
		</a>
		<a
			href="https://soundcloud.com/plsuwu"
			class="hover:brightness-50"
			target="_blank"
			referrerpolicy="no-referrer"
		>
			<MdiSoundcloud />
		</a>
		<div class="flex flex-row space-x-2 font-semibold"><div>]</div></div>
	</div>
</div>
