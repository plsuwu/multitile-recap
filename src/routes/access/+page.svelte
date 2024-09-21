<script lang="ts">
	import { page } from '$app/stores';
	import Instructions from '@components/AccessContent/Instructions.svelte';
	import Notice from '@components/AccessContent/Notice.svelte';

	$: input = '';
	$: error = { error: false, reason: '' };
	$: randomChars = mkRandChars();
	$: authOkay = false;

	function handleInputChange(inputContent: string) {
		input = inputContent;
	}

	function mkRandChars(len: number = 30) {
		const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let res = '';

		for (let i = 0; i < len; i++) {
			const n = Math.floor(Math.random() * charset.length);
			res += charset.charAt(n);
		}

		return res;
	}

	async function parseToken() {
        if (error.error) {
            error.error = false;
            error.reason = '';
        }

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

<div class="mt-48 flex h-full w-full flex-col">
	<a
		href="/"
		class="w-1/2 self-center transition-opacity duration-100 hover:opacity-55"
		>{'<-'} go back</a
	>
	<div class="mt-16 flex w-full flex-col items-end self-center p-4">
		<div class="flex w-1/3 flex-col items-end self-center p-4">
			<div class="justify-center">
				<p>
					Twitch Recaps make use of functions not exposed via the
					Twitch API, meaning recap data cannot be retrieved without a
					session token scoped via Twitch's
					<samp
						class="whitespace-nowrap rounded-xl bg-black/30 px-1 text-sm"
						>protected_login</samp
					> endpoint.
				</p>
				<div class="my-4"></div>
				<p>
					Though it's less than ideal, the workaround I'm currently
					employing involves authentication with a token from the
					header of an authorized request on <a
						href="https://www.twitch.tv/"
						target="_blank"
						referrerpolicy="no-referrer"
						class="text-blue-500 underline transition-all duration-200 hover:brightness-50"
						>twitch.tv</a
					>.
				</p>
				<div class="my-4"></div>
			</div>
		</div>
	</div>
	<div class="mt-24 flex flex-col justify-center">
		<div class="flex flex-row items-center justify-center space-x-6">
			<input
				class="min-w-[450px] rounded-md border-2 px-2 py-0.5"
				type="text"
				placeholder={`Authorization: OAuth ${randomChars}`}
				bind:value={input}
				on:input={(event) =>
					handleInputChange(event.currentTarget.value)}
			/>
			<button
				on:click={parseToken}
				class="rounded-md border p-1 px-2 transition-all duration-200 hover:border-black/35 hover:opacity-55"
				>submit</button
			>
		</div>
		<div class="my-2 block h-[24px]">
			{#key error || authOkay}
				{#if error.error === true}
					<div class="my-2 text-center text-red-700">
						{error.reason}
					</div>
				{/if}
				{#if authOkay}

				<div class="my-2 text-center text-blue-400">
					<a
						href="/api/generate?wants=true"
						class="transition-opacity duration-100 hover:opacity-55"
						>generate recaps {'->'}</a
					>
                </div>
				{/if}
			{/key}
		</div>
	</div>

	<div
		class="mt-24 flex h-full w-1/4 flex-col items-center justify-center self-center p-4"
	>
		<Instructions />
		<div class="my-1"></div>
		<Notice />
		<div class="mt-6 flex w-1/2 flex-col items-end self-center p-4"></div>
	</div>
</div>
