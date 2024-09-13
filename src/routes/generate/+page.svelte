<script lang="ts">
	import { page } from '$app/stores';
    import type { RecapsQueryResponse } from '$lib/types';

	console.log($page.data);

    const recaps: RecapsQueryResponse = $page.data.recaps;

	function localeString(date: Date) {
		return date.toLocaleString();
	}
</script>

<!-- {#if subs} -->
<!-- 	<div class="my-4">recaps:</div> -->
<!-- 	{#each recaps as recap} -->
<!-- 		{#if recap.self.recap.streamsPlayed !== ''} -->
<!-- 			<div class="flex flex-row"> -->
<!-- 				{recap.displayName}: -->
<!-- 				<ul class="flex flex-col"> -->
<!-- 					<div> -->
<!-- 						watched {recap.self.recap.streamsPlayed}/ streams for {recap -->
<!-- 							.self.recap.minutesWatched} minutes -->
<!-- 					</div> -->
<!-- 					<div>sent {recap.self.recap.chatMessagesSent} chats</div> -->
<!-- 					<div>watched streams</div> -->
<!-- 				</ul> -->
<!-- 			</div> -->
<!-- 		{/if} -->
<!-- 	{/each} -->
<!-- {/if} -->
<!---->
<!-- {#if follows} -->
<!-- 	<div class="my-4">FOLLOWING:</div> -->
<!-- 	{#each follows as broadcaster} -->
<!-- 		<div class="flex flex-row"> -->
<!-- 			{broadcaster.broadcaster_name}: -->
<!-- 			<ul> -->
<!-- 				<li> -->
<!-- 					{localeString(broadcaster.followed_at)} -->
<!-- 				</li> -->
<!-- 			</ul> -->
<!-- 		</div> -->
<!-- 	{/each} -->
<!-- {/if} -->
<!---->
<!-- <!-- {#if recaps} --> -->
<!-- <!--     <div class='my-4'>RECAPS:</div> --> -->
<!-- <!--     {#each recaps as recap} --> -->
<!-- <!--     {/each} --> -->
<!-- <!-- {/if} --> -->
<!-- <!----> -->
<!-- {#each recaps as recap} -->
<!-- 	<div -->
<!-- 		class="Layout-sc-1xcs6mc-0 ScLayoutCssVars-sc-1pn65j5-0 hOfdQX eeWGrC tw-root--theme-dark" -->
<!-- 	> -->
<!-- 		<div class="Layout-sc-1xcs6mc-0 HFdSs"> -->
<!-- 			<div class="Layout-sc-1xcs6mc-0 daZyRV"> -->
<!-- 				<div class="ScAvatar-sc-144b42z-0 ixBXm tw-avatar"> -->
<!-- 					<img -->
<!-- 						class="InjectLayout-sc-1i43xsx-0 cXFDOs tw-image tw-image-avatar size-24" -->
<!-- 						alt="tobs" -->
<!-- 						src={recap.profileImageURL} -->
<!-- 					/> -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 			<div class="Layout-sc-1xcs6mc-0 daZyRV"> -->
<!-- 				<p -->
<!-- 					class="CoreText-sc-1txzju1-0 recaps-text recaps-text__footer-large recaps-text__pink" -->
<!-- 				> -->
<!-- 					{display_name} x {recap.displayName} -->
<!-- 				</p> -->
<!-- 			</div> -->
<!-- 		</div> -->
<!-- 		<div class="Layout-sc-1xcs6mc-0 ggiWTK"> -->
<!-- 			<div class="Layout-sc-1xcs6mc-0 clReUl"> -->
<!-- 				<div class="Layout-sc-1xcs6mc-0 bHtdjj"> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 llrXzF recaps-text recaps-text__footer-large" -->
<!-- 					> -->
<!-- 						Time Watched -->
<!-- 					</p> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 recaps-text recaps-text__footer-large recaps-text__pink" -->
<!-- 					> -->
<!-- 						{recap.self.recap.minutesWatched} minutes -->
<!-- 					</p> -->
<!-- 				</div> -->
<!-- 				<div class="Layout-sc-1xcs6mc-0 eaLpbO"> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 llrXzF recaps-text recaps-text__footer-large" -->
<!-- 					> -->
<!-- 						Chats Sent -->
<!-- 					</p> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 recaps-text recaps-text__footer-large recaps-text__pink" -->
<!-- 					> -->
<!-- 						{recap.self.recap.chatMessagesSent} -->
<!-- 					</p> -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 			<div class="Layout-sc-1xcs6mc-0 fIwtOI"> -->
<!-- 				<div class="Layout-sc-1xcs6mc-0 bHtdjj"> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 llrXzF recaps-text recaps-text__footer-large" -->
<!-- 					> -->
<!-- 						Streams Watched -->
<!-- 					</p> -->
<!-- 					<p -->
<!-- 						class="CoreText-sc-1txzju1-0 recaps-text recaps-text__footer-large recaps-text__pink" -->
<!-- 					> -->
<!-- 						{recap.self.recap.streamsPlayed} of 0 -->
<!-- 					</p> -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 		</div> -->
<!-- 		<div class="Layout-sc-1xcs6mc-0 fIwtOI"> -->
<!-- 			<div class="Layout-sc-1xcs6mc-0 ivrFkx"> -->
<!-- 				<div class="ScFigure-sc-wkgzod-0 cRcKOs tw-svg"> -->
<!-- 					<svg width="114" height="38" viewBox="0 0 114 38" -->
<!-- 						><path -->
<!-- 							d="M108.997 7h-5V.002H93.019l-5.05 7h-8.971l-3 3V7h-7V0h-22v7H16.05L11 0v.001H0v24L14 38h14v-4l4 4h26.998v-4l4 4h13v-4l4 4h24.999l9-9V12l-5-5zM17 17h-7v2h7v8H6l-4-4V2h8v7h7v8zm29.999 10h-24l-4-4V9h8v10h2V9h8v10h2V9h8v18zm10 0h-8V9h8v18zm0-20h-8V2h8v5zm16.999 10h-7v2h7v8h-11l-4-4V2h8v7h7v8zm18 0h-8v2h8v8h-12l-4-4V13l4-4h12v8zm19.999 10h-8V17h-2v10h-8V2h8v7h6l4 4v14z" -->
<!-- 						></path><path -->
<!-- 							fill="#fff" -->
<!-- 							d="M17 17h-7v2h7v8H6l-4-4V2h8v7h7v8zm29.999 10h-24l-4-4V9h8v10h2V9h8v10h2V9h8v18zm9.999-18h-8v18h8V9zm0-6.999h-8v5h8V2zm17 14.999h-7v2h7v8h-11l-4-4V2h8v7h7v8zm18 0h-8v2h8v8h-12l-4-4V13l4-4h12v8zm19.999 10h-8V17h-2v10h-8V2h8v7h6l4 4v14z" -->
<!-- 						></path></svg -->
<!-- 					> -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 			<p -->
<!-- 				class="CoreText-sc-1txzju1-0 recaps-text recaps-text__footer-large" -->
<!-- 			> -->
<!-- 				#TWITCHRECAP -->
<!-- 			</p> -->
<!-- 		</div> -->
<!-- 	</div> -->
<!-- {/each} -->
