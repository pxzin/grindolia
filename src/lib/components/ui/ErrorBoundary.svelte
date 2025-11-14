<script lang="ts">
	/**
	 * ErrorBoundary Component
	 * Catches and displays errors gracefully
	 */
	import Card from './Card.svelte';
	import Button from './Button.svelte';
	import { AlertCircle } from 'lucide-svelte';

	interface Props {
		children?: any;
		fallback?: any;
		onError?: (error: Error) => void;
	}

	let { children, fallback, onError }: Props = $props();

	let hasError = $state(false);
	let error = $state<Error | null>(null);

	function handleError(err: Error) {
		hasError = true;
		error = err;
		onError?.(err);
		console.error('ErrorBoundary caught:', err);
	}

	function reset() {
		hasError = false;
		error = null;
	}

	// Simple error catching - in production, you'd want a more robust solution
	$effect(() => {
		const handleGlobalError = (event: ErrorEvent) => {
			handleError(event.error);
		};

		window.addEventListener('error', handleGlobalError);
		return () => window.removeEventListener('error', handleGlobalError);
	});
</script>

{#if hasError}
	{#if fallback}
		{@render fallback({ error, reset })}
	{:else}
		<Card variant="elevated" class="max-w-2xl mx-auto my-8">
			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div class="w-16 h-16 rounded-full bg-arcana-orange-600/10 flex items-center justify-center">
						<AlertCircle size={32} class="text-arcana-orange-600" />
					</div>
				</div>

				<h2 class="text-2xl font-serif text-arcana-text-primary mb-2">Something went wrong</h2>
				<p class="text-arcana-text-secondary mb-6">
					An unexpected error occurred. Please try refreshing the page.
				</p>

				{#if error}
					<details class="text-left mb-6">
						<summary class="text-sm text-arcana-text-muted cursor-pointer hover:text-arcana-text-secondary">
							Error details
						</summary>
						<pre class="mt-2 p-4 bg-arcana-bg-primary rounded-lg text-xs text-arcana-orange-600 overflow-auto">
							{error.message}
							{#if error.stack}
								{'\n\n'}
								{error.stack}
							{/if}
						</pre>
					</details>
				{/if}

				<Button variant="primary" onclick={reset}>
					Try Again
				</Button>
			</div>
		</Card>
	{/if}
{:else}
	{@render children?.()}
{/if}
