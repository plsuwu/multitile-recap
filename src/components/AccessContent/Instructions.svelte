<script lang="ts">
	import AccordionAccess from '@components/Accordion/AccordionAccess.svelte';
	import ImageModal from '@components/ImageModal/ImageModal.svelte';

	let accordionOpen = false;

	let imageUrl = 'oauth_head.webp';
	$: open = false;
	$: accordionOpen = false;

	function toggleImageModal() {
		open = open === true ? false : true;
		open = open;
	}
</script>

<ImageModal {imageUrl} {open} toggleModal={toggleImageModal} />
<AccordionAccess open={accordionOpen}>
	<span slot="title">obtaining your access token</span>
	<span slot="details">
		<div class="text-sm">
			<ol class="list-inside list-decimal space-y-2 p-2">
				<li>
					Navigate to
					<a
						href="https://www.twitch.tv/"
						target="_blank"
						referrerpolicy="no-referrer"
						class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
						>twitch.tv</a
					>
					and login to your account (if you aren't already logged in).
				</li>
				<li>
					Open your browser's developer tools by either right-clicking
					and selecting 'inspect', or pressing
					<samp
						class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
						>F12</samp
					>.
				</li>
				<li>
					Navigate to the <samp
						class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
						>network</samp
					>
					tab.
				</li>

				<li>
					Refresh the page to perform the associated network requests,
					and apply a filter to search for the term
					<samp
						class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
						>gql</samp
					>
				</li>
				<li>
					Select the
					<samp
						class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-xs"
						>Headers</samp
					> tab, and copy-paste its content into the field above.
				</li>
				<li>
					Hit submit - if all is ok, a 'continue' button should
					appear.
				</li>
			</ol>
		</div>
		<div class="my-3 border-b border-black/10"></div>
		<button on:click={toggleImageModal}>
			<img
				src={imageUrl}
				alt="token directions"
				class={`${open ? 'hidden' : 'inline-flex'} w-full rounded-md transition-opacity duration-100 hover:brightness-75`}
			/>
		</button>
		<p class="mt-1 text-center text-xs italic opacity-75">
			(click to zoom)
		</p>
	</span>
</AccordionAccess>
