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
				I'm not doing anything nefarious (you probably shouldn't
				be giving this token to this site). With this said, the provided
				token's validity can be revoked very easily by either logging
				out of the session that the token was pulled from, or clicking
				the "Sign Out Everywhere" button on
				<a
					href="https://www.twitch.tv/settings/security"
					target="_blank"
					referrerpolicy="no-referrer"
					class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
					>your security settings page</a
				>.
			</p>
			<div class="my-3 border-b border-black/10"></div>
			<p class="mb-1 text-base font-semibold">credential storage</p>
			<p>
				This server only retains the "legitimate" OAuth tokens
				(which are scoped only to read information about your follows
				and subscriptions), alongside the associated following,
				subscription, and recap data we fetch. This data is cached on
				the server to reduce the number and size of requests that we
				need to make to the Twitch API.
				<br />
				We otherwise purge your
				<samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					protected_login</samp
				> token as quickly as is reasonably possible - it is flushed from
				our server after either:
			</p>
			<ul class="list-inside list-disc flex-col indent-6">
				<li>an attempt to fetch recap data is made; or,</li>
				<li>two minutes has elapsed since the token was submitted;</li>
			</ul>
			<p class="pt-1">Whichever comes first.</p>
			<div class="my-3 border-b border-black/10"></div>
			<p class="mb-1 text-base font-semibold">token usage</p>
			<p>
				Twitch pulls Recap data from <samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					https://gql.twitch.tv/
				</samp>. The OAuth scopes available through Twitch aren't capable of
				facilitatating access to the
				<samp
					class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
				>
					self
				</samp> field of a Recap request. This field contains user-specific
				data on monthly channel engagement (i.e, minutes/streamed watched,
				chats sent, etc), which is obviously integral to generating a recap
				card. We are therefore making this one API request using the
				token, deleting it from the server and caching the response data from
				a successful query.
			</p>
			<div class="mb-8 mt-3 border-b border-black/10"></div>
			<p>
				This site's source code and commit history can be found
				at
				<a
					href="https://github.com/plsuwu/tiles"
					target="blank"
					referrerpolicy="no-referrer"
					class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
					>github.com/plsuwu</a
				>.
			</p>
		</div>
	</span>
</AccordionAccess>
