export default {
	tabWidth: 4,
	useTabs: true,
	printWidth: 80,
	trailingComma: 'all',
	singleQuote: true,
	semi: true,
	plugins: [
		'prettier-plugin-svelte',
		'prettier-plugin-tailwindcss',
		// '@trivago/prettier-plugin-sort-imports',
	],
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
			},
		},
	],
};
