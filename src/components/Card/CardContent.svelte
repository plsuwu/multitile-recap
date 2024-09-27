<script lang="ts">
	import type { RecapsQueryResponse } from '$lib/types';
	import Twitch from './Twitch.svg?raw';

	export let recap: RecapsQueryResponse;
	export let displayName: string;

	const formatted = (time: number) => {
		const days = Math.floor(time / 1440);
		const hours = Math.floor((time % 1440) / 60);
		const mins = time % 60;

		let res = '';

		if (days > 0) res += `${days}d `;
		if (hours > 0) res += `${hours}h `;
		if (mins > 0 && days <= 0) res += `${mins}m `;
		else if (mins == 0) res += '0m';

		return res.trim();
	};

	const watchtime = formatted(
		Math.round(Number(recap.data.user.self.recap.minutesWatched))
	);
	const chats = Number(recap.data.user.self.recap.chatMessagesSent);
	const metricsCenter = [
		{ key: 'Time Watched', value: watchtime },
		{ key: 'Chats Sent', value: chats },
	];

	const { streamsPlayed } = recap.data.user.self.recap;
	const { streamsStreamed } = recap.data.channel.recap;
</script>

<div
	class="flex flex-col text-center font-sans text-[24px] font-semibold"
	style="line-height: 120%;"
>
	<div class="flex-1">
		<div class="flex flex-col justify-center self-center">
			<img
				src={recap.data.user.profileImageURL}
				alt={recap.data.channel.displayName}
				class="my-4 size-[167px] self-center rounded-full"
			/>
			<div class="text-[#fab4ff]">
				{displayName} x {recap.data.user.displayName}
			</div>
		</div>
		<div class="mt-[50px] flex flex-row justify-around">
			{#each metricsCenter as metric}
				<div class="flex flex-col">
					<div>{metric.key}</div>
					<div class="text-[#fab4ff]">{metric.value}</div>
				</div>
			{/each}
		</div>

		<div class="mt-[50px]">Streams Watched</div>
		<div class="text-[#fab4ff]">
			{Number(streamsPlayed)} of {streamsStreamed}
		</div>
	</div>

	<div class="flex-0 mt-[50px] flex flex-row items-center justify-around">
		<div class="text-[#fab4ff]">{@html Twitch}</div>
		<div>#TWITCHRECAP</div>
	</div>
</div>
