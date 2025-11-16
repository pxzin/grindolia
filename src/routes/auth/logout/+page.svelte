<script lang="ts">
	/**
	 * Logout Page
	 * Handles user logout and session cleanup
	 */

	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { LogOut } from 'lucide-svelte';
	import { characterStore } from '$lib/stores/character.svelte';

	let status = $state<'loading' | 'success' | 'error'>('loading');
	let error = $state<string | null>(null);

	onMount(async () => {
		await performLogout();
	});

	async function performLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to logout');
			}

			// Reset character store
			characterStore.reset();

			status = 'success';

			// Redirect to login after short delay
			setTimeout(() => {
				goto('/auth/login');
			}, 2000);
		} catch (err) {
			status = 'error';
			error = err instanceof Error ? err.message : 'An error occurred during logout';
			console.error('Logout error:', err);
		}
	}

	function goToLogin() {
		goto('/auth/login');
	}
</script>

<svelte:head>
	<title>Logout - Grindolia</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-4"
>
	<Card variant="elevated" class="w-full max-w-md">
		<div class="p-8 text-center">
			{#if status === 'loading'}
				<div class="animate-pulse">
					<LogOut size={48} class="text-arcana-gold-400 mx-auto mb-4" />
					<h1 class="text-2xl font-serif text-arcana-text-primary mb-2">Logging Out...</h1>
					<p class="text-arcana-text-secondary">Ending your session safely</p>
				</div>
			{:else if status === 'success'}
				<LogOut size={48} class="text-arcana-green-400 mx-auto mb-4" />
				<h1 class="text-2xl font-serif text-arcana-text-primary mb-2">Logged Out Successfully</h1>
				<p class="text-arcana-text-secondary mb-4">Your session has been terminated</p>
				<p class="text-sm text-arcana-text-muted">Redirecting to login page...</p>
			{:else if status === 'error'}
				<LogOut size={48} class="text-arcana-orange-400 mx-auto mb-4" />
				<h1 class="text-2xl font-serif text-arcana-text-primary mb-2">Logout Failed</h1>
				<p class="text-arcana-orange-400 mb-4">{error}</p>
				<Button variant="primary" onclick={goToLogin}>Go to Login</Button>
			{/if}
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
