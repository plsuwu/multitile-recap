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
				tokens (which are scoped only to read information about your
				follows and subscriptions), alongside the associated following,
				subscription, and recap data we fetch. This is cached until your
				OAuth token needs to be refreshed. We otherwise purge this <samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					protected_login</samp
				> token as quickly as reasonably possible, meaning we flush it after
				either:
			</p>
			<ul class="list-inside list-disc flex-col indent-6">
				<li>An attempt to fetch recap data is made; or,</li>
				<li>Two minutes has elapsed since the token was submitted,</li>
			</ul>
			<p>whichever comes first.</p>
			<div class="my-3 border-b border-black/10"></div>
			<p class="mb-1 text-base font-semibold">how this token is used</p>
			<p>
				Twitch pulls Recap data from <samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					https://gql.twitch.tv/
				</samp>
				- though does not provide the correct OAuth scopes to facilitate
				access to a specific field required to build a subscription recap
				-
				<samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					self
				</samp> - which contains user-specific details on monthly channel
				engagement (i.e, minutes/streamed watched, chats sent, etc). This
				is obviously integral to generating a recap card grid.
			</p>
			<div class="my-3 border-b border-black/10"></div>
			<p>
				If you wish, this application's source code and commit history
				can be found at
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
