import Icons from 'unplugin-icons/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		Icons({
			compiler: 'svelte',
		}),
		sveltekit(),
	],
});
