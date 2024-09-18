<script lang="ts">
	import { navigating, page } from '$app/stores';
	import ImageModal from '@components/ImageModal/ImageModal.svelte';
	import { redirect } from '@sveltejs/kit';

	$: input = '';
	$: error = { error: false, reason: '' };
	$: open = false;
	$: randomChars = mkRandChars();
	$: authOkay = false;

	let imageUrl = 'oauth_head.webp';

	function toggleImageModal() {
		open = open === true ? false : true;
		open = open;
	}

	function handleInputChange(inputContent: string) {
		input = inputContent;
	}

	function mkRandChars(len: number = 30) {
		const an = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let res = '';

		for (let i = 0; i < len; i++) {
			const n = Math.floor(Math.random() * an.length);
			res += an.charAt(n);
		}

		return res;
	}

	async function parseToken() {
		let body: string;

		if (input.toLowerCase().includes('oauth ')) {
			const t = input.toLowerCase().split('oauth ')[1];

			if (!t || t.length !== 30) {
				error = {
					error: true,
					reason: `Invalid OAuth token.`,
				};
				return;
			}

			body = t;
		} else {
			if (!input || input.length !== 30) {
				error = {
					error: true,
					reason: `Invalid OAuth token.`,
				};
				return;
			}

			body = input;
		}

		const nonAscii = body.toLowerCase().match(/[^a-z0-9]/gi);
		if (nonAscii) {
			error = {
				error: true,
				reason: 'OAuth token should be alpha-numeric',
			};
			return;
		}

		const res = await fetch('/api/access', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: body, user: $page.data.user }),
		});

		if (!res.ok) {
			error = {
				error: true,
				reason: 'OAuth token seems invalid',
			};
		} else {
			authOkay = true;
			return await res.json();
		}
	}
</script>

<ImageModal {imageUrl} {open} toggleModal={toggleImageModal} />
<div class="flex h-screen flex-col">
	<div class="mt-16 flex w-full flex-col items-end self-center p-4">
		<div class="flex w-1/3 flex-col items-end self-center p-4">
			<div class="justify-center">
				<p>
					Recaps make use of extended functionality that Twitch does
					not expose via its API; this means I am unable to fetch
					recap content with the scopes provided by the OAuth 2.0
					access token.
				</p>
				<div class="my-8"></div>
				<p>
					For this reason, this application requires a globally-scoped
					OAuth token which can be retrieved via the
					<samp
						class="rounded-xl bg-pink-200 px-1 text-sm italic"
						>Authorization</samp
					>
					header of an authorized HTTP request on
					<a
						href="https://www.twitch.tv"
						target="_blank"
						referrerpolicy="no-referrer"
						class="text-blue-500 underline transition-opacity duration-100 hover:brightness-50"
						>twitch.tv</a
					>:
				</p>
			</div>
		</div>

		<div class="mt-6 flex w-1/2 flex-col items-end self-center p-4">
			<button on:click={toggleImageModal}>
				<img
					src={imageUrl}
					alt="token directions"
					class={`${open ? 'hidden' : 'inline-flex'} w-full rounded-md transition-opacity duration-100 hover:brightness-75`}
				/>
			</button>
		</div>
	</div>
	<div class="mt-12 flex flex-col justify-center">
		<div class="flex flex-row items-center justify-center space-x-6">
			<a href="/" class="transition-opacity duration-100 hover:opacity-55"
				>{'<-'} home</a
			>
			<input
				class="min-w-[450px] rounded-md border-2 px-2"
				type="text"
				placeholder={`Authorization: OAuth ${randomChars}`}
				bind:value={input}
				on:input={(event) =>
					handleInputChange(event.currentTarget.value)}
			/>
			{#if authOkay}
				<a
					href="/api/generate"
					class="transition-opacity duration-100 hover:opacity-55"
					>recaps {'->'}</a
				>
			{:else}
				<button
					on:click={parseToken}
					class="transition-opacity duration-100 hover:opacity-55"
					>submit {'->'}</button
				>
			{/if}
		</div>

		{#key error}
			{#if error.error === true}
				<div class="my-2 text-center text-red-700">
					{error.reason}
				</div>
			{:else}
				<div class="my-2 block h-[24px]"></div>
			{/if}
		{/key}
	</div>

	<div class="flex w-1/3 flex-col items-start self-center p-4">
		<p>
			The access token is purged from the server once the recap data is
			fetched and cached. <br /><br />
			Also note that the token can be revoked by logging out of that particular
			twitch session, or by clicking
			<samp class="rounded-xl bg-pink-200 px-1 text-sm italic">
				Sign Out Everywhere</samp
			>
			on your<a
				href="https://www.twitch.tv/settings/security"
				target="_blank"
				referrerpolicy="no-referrer"
				class="text-blue-500 underline transition-opacity duration-100 hover:brightness-50"
				>Security and Privacy</a
			> settings page on twitch.tv.
		</p>
	</div>
</div>
