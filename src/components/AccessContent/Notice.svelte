<script lang="ts">
	import AccordionAccess from '@components/Accordion/AccordionAccess.svelte';
	let accordionOpen = false;
</script>

<AccordionAccess open={accordionOpen}>
	<span slot="title">security</span>
	<span slot="details">
		<div class="text-sm">
			<p>
				<span class="mb-1 text-base font-semibold"> tl;dr</span>
			</p>
			<p>
				Yes, this type of token probably provides unreasonably extensive
				access to your account, and you kind of just have to trust that
				I'm not doing anything nefarious. With this said, the provided
				token's validity can be revoked at from
				<a
					href="https://www.twitch.tv/settings/security"
					target="_blank"
					referrerpolicy="no-referrer"
					class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
					>your security settings page</a
				>, or simply by logging out of the session that the token was
				pulled from.
			</p>
			<div class="my-3 border-b border-black/10"></div>
			<p class="mb-1 text-base font-semibold">credential storage</p>
			<p>
				This application only intends to retain the "legitimate" OAuth
				tokens (which are scoped to read only following and subscription
				metrics), alongside the following/subscription/recap data we
				fetch. We otherwise purge this <samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					protected_login</samp
				> token as quickly as is reasonable - either:
			</p>
			<ul class="list-inside list-disc flex-col indent-6">
				<li>an attempt to fetch recap data is made; or,</li>
				<li>5 minutes has elapsed since the token was cached,</li>
			</ul>
			<p>(whichever comes first).</p>
			<div class="my-3 border-b border-black/10"></div>
			<p class="mb-1 text-base font-semibold">token usage</p>
			<p>
				Twitch pulls Recap data from <samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					https://gql.twitch.tv/
				</samp>
				- there are no available OAuth scopes that facilitate access to a
				specific field -
				<samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					self
				</samp> - containing per-user details on channel engagement
			</p>
			<div class="my-3 border-b border-black/10"></div>
			<p>
				This application's source code is open and available at
				<a
					href="https://github.com/plsuwu/multitile-recap"
					target="blank"
					referrerpolicy="no-referrer"
					class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
					>github.com/plsuwu</a
				> for review.
			</p>
		</div>
	</span>
</AccordionAccess>
