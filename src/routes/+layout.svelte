<script lang="ts">
	import '../app.css';
	import Footer from '@components/Footer/Footer.svelte';
</script>

<head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="true"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&display=swap"
		rel="stylesheet"
	/>
</head>

<div class="flex min-h-screen flex-col">
	<div class="flex min-h-full flex-1 flex-row items-center justify-center">
		<slot />
	</div>
    <div class='mt-24'>
		<Footer />
	</div>
</div>
