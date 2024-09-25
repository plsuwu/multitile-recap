<script lang="ts">
	import { navigating, page } from '$app/stores';
	import Instructions from '@components/AccessContent/Instructions.svelte';
	import { getRgba } from '$lib/internal';
	import Notice from '@components/AccessContent/Notice.svelte';
	import { BarLoader, Circle } from 'svelte-loading-spinners';

	$: input = '';
	$: error = { error: false, reason: '' };
	$: randomChars = mkRandChars();
	$: authOkay = false;
	$: loadingRecaps = false;

	const { color } = $page.data.color;

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
		loadingRecaps = true;

		// clear the existing error if is set
		if (error.error) {
			error.error = false;
			error.reason = '';
		}

		let body: string;
		if (input.toLowerCase().includes('oauth ')) {
			const t = input.toLowerCase().split('oauth ')[1];
			if (!t || t.length !== 30) {
				error = { error: true, reason: `Invalid OAuth token.` };
				loadingRecaps = false;
				return;
			}
			body = t;
		} else {
			if (!input || input.length !== 30) {
				error = { error: true, reason: `Invalid OAuth token.` };

				loadingRecaps = false;
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

			loadingRecaps = false;
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
				reason: 'OAuth token seems invalid for this account.',
			};
		} else {
			authOkay = true;

			loadingRecaps = false;
			return await res.json();
		}

		// catch anything that falls through
		loadingRecaps = false;
	}

	const formattedColor = color ? getRgba(color) : { bg: '#FFF', fg: '#000' };
</script>

<div class="mt-10 flex h-full w-full flex-col lg:mt-48">
	<a
		href="/"
		class="w-full self-center px-4 transition-opacity duration-100 hover:opacity-55 lg:w-1/2"
		>{'<-'} go back</a
	>
	<div class="mt-12 flex w-full flex-col items-end self-center p-4">
		<div
			class="flex w-full flex-col items-end self-center p-4 px-6 shadow-sm lg:w-1/4 lg:p-4"
		>
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
					> (further instructions below).
				</p>
				<div class="my-4"></div>
			</div>
		</div>
	</div>
	<div class="mt-12 flex flex-col justify-center lg:mt-24">
		<div
			class="mx-4 flex flex-col items-center justify-center lg:mx-0 lg:flex-row lg:space-x-4"
		>
			<input
				class="min-w-full rounded-md border-2 px-2 py-0.5 lg:min-w-[450px]"
				type="text"
				placeholder={`Authorization: OAuth ${randomChars}`}
				bind:value={input}
				on:input={(event) =>
					handleInputChange(event.currentTarget.value)}
			/>
			{#if loadingRecaps}
				<div
					class="mt-4 p-0.5 px-[19px] pl-[20px] transition-all duration-200 lg:mt-0"
					style={`background-color: ${formattedColor.bg}`}
				>
                    <Circle color={formattedColor.fg} size='30' />

				</div>
			{:else}

				<button
					on:click={parseToken}
					class="mt-4 rounded-md border p-1 px-2 transition-all duration-200 hover:border-black/35 hover:opacity-55 lg:mt-0"
					>submit</button
				>
			{/if}
		</div>
		<div class="my-2 block h-[24px]">
			{#key error || authOkay}
				{#if error.error === true}
					<div class="my-2 text-center text-red-700">
						{error.reason}
					</div>
				{/if}
				{#if authOkay}
					<div
						class="my-2 flex flex-row justify-center text-center text-blue-400"
					>
						<!-- {#key $page.url} -->
						{#if $navigating}
							<div
                            class='mt-3'
								style={`background-color: ${formattedColor.bg}`}
							>
								<BarLoader color={formattedColor.fg} />
							</div>
						{:else}
							<a
								href="/recaps"
								class="transition-opacity duration-100 hover:opacity-55"
								>generate recaps {'->'}</a
							>
						{/if}
						<!-- {/key} -->
					</div>
				{/if}
			{/key}
		</div>
	</div>

	<div
		class="mt-12 flex h-full w-full flex-col items-center justify-center self-center p-4 md:w-1/2 xl:w-1/3"
	>
		<Instructions />
		<div class="my-1"></div>
		<Notice />
		<div
			class="mt-6 flex flex-col items-end self-center p-4 xl:w-1/2"
		></div>
	</div>
</div>
