/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter'],
                mono: ['Noto Sans Mono'],
			},
		},
	},
	plugins: [],
};
