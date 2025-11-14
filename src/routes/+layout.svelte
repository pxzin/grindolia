<script lang="ts">
	import '@unocss/reset/tailwind.css';
	import 'uno.css';
	import { initI18n } from '../i18n/config';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Initialize i18n
	onMount(() => {
		initI18n();
	});

	// Apply theme class to body
	let theme = $state('default');

	function setTheme(newTheme: string) {
		theme = newTheme;
		document.documentElement.setAttribute('data-theme', newTheme);
	}

	onMount(() => {
		// Load saved theme from localStorage
		const savedTheme = localStorage.getItem('theme') || 'default';
		setTheme(savedTheme);
	});
</script>

<svelte:head>
	<title>Grindolia - Fantasy RPG</title>
	<meta name="description" content="A humorous fantasy RPG adventure" />
</svelte:head>

<div class="app min-h-screen bg-gray-1 text-gray-12">
	{@render children()}
</div>

<style>
	:global(:root) {
		/* Default theme colors */
		--color-surface: var(--gray-2);
		--color-surface-raised: var(--gray-3);
		--color-text: var(--gray-12);
		--color-text-subtle: var(--gray-11);
		--color-text-inverse: var(--gray-1);
		--color-primary: var(--blue-9);
		--color-primary-hover: var(--blue-10);
		--color-primary-active: var(--blue-11);
		--color-success: var(--green-9);
		--color-warning: var(--amber-9);
		--color-error: var(--red-9);
		--color-info: var(--blue-9);
	}

	:global([data-theme='warrior']) {
		--color-primary: var(--red-9);
		--color-primary-hover: var(--red-10);
		--color-primary-active: var(--red-11);
	}

	:global([data-theme='mage']) {
		--color-primary: var(--purple-9);
		--color-primary-hover: var(--purple-10);
		--color-primary-active: var(--purple-11);
	}

	:global([data-theme='rogue']) {
		--color-primary: var(--green-9);
		--color-primary-hover: var(--green-10);
		--color-primary-active: var(--green-11);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
	}
</style>
