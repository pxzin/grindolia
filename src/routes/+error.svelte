<script lang="ts">
	/**
	 * Error Page
	 * Global error handler for 404, 500, and other errors
	 */
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { Home, AlertCircle, Ghost, ServerCrash } from 'lucide-svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message || 'An unexpected error occurred');

	const errorConfig = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					icon: Ghost,
					title: 'Lost in the Void',
					description: "This page doesn't exist in our realm. Perhaps it was consumed by darkness?",
					color: 'text-arcana-cyan-500'
				};
			case 500:
				return {
					icon: ServerCrash,
					title: 'The Magic Failed',
					description: 'Our spells encountered an unexpected error. Please try again later.',
					color: 'text-arcana-orange-600'
				};
			default:
				return {
					icon: AlertCircle,
					title: 'Something Went Wrong',
					description: message,
					color: 'text-arcana-text-secondary'
				};
		}
	});
</script>

<svelte:head>
	<title>Error {status} - Grindolia</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center p-4 bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary"
>
	<Card variant="elevated" class="max-w-2xl w-full">
		<div class="p-8 text-center">
			<!-- Icon -->
			<div class="mb-6 flex justify-center">
				<div
					class="w-24 h-24 rounded-full bg-arcana-bg-elevated flex items-center justify-center"
				>
					<svelte:component this={errorConfig.icon} size={48} class={errorConfig.color} />
				</div>
			</div>

			<!-- Error Code -->
			<div class="mb-4">
				<span class="text-6xl font-bold font-mono {errorConfig.color}">{status}</span>
			</div>

			<!-- Title -->
			<h1 class="text-3xl font-serif text-arcana-text-primary mb-4">
				{errorConfig.title}
			</h1>

			<!-- Description -->
			<p class="text-arcana-text-secondary mb-8 max-w-md mx-auto">
				{errorConfig.description}
			</p>

			<!-- Technical Details (DEV only) -->
			{#if import.meta.env.DEV && $page.error}
				<details class="text-left mb-6">
					<summary
						class="text-sm text-arcana-text-muted cursor-pointer hover:text-arcana-text-secondary mb-2"
					>
						Technical Details
					</summary>
					<pre
						class="text-xs bg-arcana-bg-primary p-4 rounded-lg text-arcana-text-primary overflow-auto">{JSON.stringify(
							{
								status: $page.status,
								message: $page.error?.message,
								stack: $page.error?.stack
							},
							null,
							2
						)}</pre>
				</details>
			{/if}

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button variant="primary" onclick={() => goto('/')} class="flex items-center gap-2">
					<Home size={18} />
					Return Home
				</Button>
				<Button variant="secondary" onclick={() => window.history.back()}>Go Back</Button>
			</div>
		</div>
	</Card>
</div>

<style>
	.bg-gradient-radial {
		background: radial-gradient(
			ellipse at center,
			var(--color-arcana-bg-primary),
			rgba(93, 106, 184, 0.05),
			var(--color-arcana-bg-primary)
		);
	}
</style>
