<script lang="ts">
	import * as Accordion from '@/components/ui/accordion/index';
	import { SubscriptionTier } from '@/lib/utils';

	interface Subscription {
		broadcaster_id: string;
		broadcaster_login: string;
		broadcaster_name: string;
		gifter_id?: string;
		gifter_login?: string;
		is_gift: boolean;
		tier: SubscriptionTier;
	}

	interface Follow {
		broadcaster_id: string;
		broadcaster_login: string;
		broadcaster_name: string;
		followed_at: string;
	}

	export let subs: Subscription[];
	export let follows: Follow[];

	$: fRows = Math.ceil(follows.length / 10);
	$: sRows = Math.ceil(subs.length / 5);
</script>

<Accordion.Root class="w-screen max-w-full flex flex-col px-24">
	<Accordion.Item value="subs" class="w-full">
		<Accordion.Trigger class="w-full">subscriptions</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-col w-full">
				{#each Array(sRows) as _, rowIdx}
					<div class="flex flex-col w-full">
						{#each subs.slice(rowIdx * 5, (rowIdx + 1) * 5) as sub}
							<div class="flex-1 border-b border-black space-x-3">
								{sub.broadcaster_name}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="following">
		<Accordion.Trigger class="w-full">following</Accordion.Trigger>
		<Accordion.Content class="w-full">
			<div class="flex flex-col w-full">
				{#each Array(fRows) as _, rowIdx}
					<div class="flex w-full">
						{#each follows.slice(rowIdx * 10, (rowIdx + 1) * 10) as follow}
							<div class="flex-1 border-b border-black space-x-3">
								{follow.broadcaster_name}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
