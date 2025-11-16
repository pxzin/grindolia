<script lang="ts">
	/**
	 * Login Page
	 * Dark Fantasy authentication interface
	 */

	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to character selection
				goto('/character/select');
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary animate-fadeIn">
	<div class="w-full max-w-md">
		<!-- Title Section -->
		<div class="text-center mb-8">
			<h1 class="text-5xl font-serif text-arcana-gold-400 mb-4 drop-shadow-[0_0_20px_rgba(201,152,74,0.4)] animate-glow">
				Grindolia
			</h1>
			<p class="text-arcana-text-secondary">Enter the realm of shadows and magic</p>
		</div>

		<!-- Login Card -->
		<Card variant="elevated">
			<h2 class="text-2xl font-serif text-arcana-gold-400 mb-6 text-center">
				Welcome Back
			</h2>

			<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
				{#if error}
					<div class="bg-arcana-orange-600/10 border border-arcana-orange-600/30 rounded-xl p-4">
						<p class="text-arcana-orange-600 text-sm">{error}</p>
					</div>
				{/if}

				<Input
					label="Username or Email"
					type="email"
					placeholder="Enter your username"
					bind:value={email}
					required
					disabled={isLoading}
				/>

				<Input
					label="Password"
					type="password"
					placeholder="Enter your password"
					bind:value={password}
					required
					disabled={isLoading}
				/>

				<div class="pt-4">
					<Button
						variant="primary"
						class="w-full"
						onclick={handleLogin}
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
				</div>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-arcana-text-muted">
					Don't have an account?
					<a
						href="/auth/register"
						class="text-arcana-gold-600 hover:text-arcana-gold-500 transition-colors ml-1"
					>
						Register
					</a>
				</p>
			</div>
		</Card>
	</div>
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

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes glow {
		0%, 100% {
			text-shadow: 0 0 20px rgba(201, 152, 74, 0.4);
		}
		50% {
			text-shadow: 0 0 30px rgba(201, 152, 74, 0.6);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.5s ease-out;
	}

	.animate-glow {
		animation: glow 3s ease-in-out infinite;
	}
</style>
