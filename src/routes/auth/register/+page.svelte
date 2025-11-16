<script lang="ts">
	/**
	 * Registration Page
	 * Dark Fantasy account creation interface
	 */

	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let errors = $state<Record<string, string>>({});
	let isLoading = $state(false);

	async function handleRegister() {
		// Validate
		const newErrors: Record<string, string> = {};

		if (!username) newErrors.username = 'Username is required';
		if (!email) newErrors.email = 'Email is required';
		if (!password) newErrors.password = 'Password is required';
		if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
		if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

		if (Object.keys(newErrors).length > 0) {
			errors = newErrors;
			return;
		}

		isLoading = true;
		errors = {};

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password })
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to character selection
				goto('/character/select');
			} else {
				errors = { general: data.error || 'Registration failed' };
			}
		} catch (err) {
			errors = { general: 'An error occurred. Please try again.' };
			console.error('Registration error:', err);
		} finally {
			isLoading = false;
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
			<p class="text-arcana-text-secondary">Begin your epic adventure</p>
		</div>

		<!-- Registration Card -->
		<Card variant="elevated">
			<h2 class="text-2xl font-serif text-arcana-gold-400 mb-6 text-center">
				Create Account
			</h2>

			<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
				{#if errors.general}
					<div class="bg-arcana-orange-600/10 border border-arcana-orange-600/30 rounded-xl p-4">
						<p class="text-arcana-orange-600 text-sm">{errors.general}</p>
					</div>
				{/if}

				<Input
					label="Username"
					type="text"
					placeholder="Choose a username"
					bind:value={username}
					error={errors.username}
					required
					disabled={isLoading}
				/>

				<Input
					label="Email"
					type="email"
					placeholder="Enter your email"
					bind:value={email}
					error={errors.email}
					required
					disabled={isLoading}
				/>

				<Input
					label="Password"
					type="password"
					placeholder="Create a password"
					bind:value={password}
					error={errors.password}
					required
					disabled={isLoading}
				/>

				<Input
					label="Confirm Password"
					type="password"
					placeholder="Confirm your password"
					bind:value={confirmPassword}
					error={errors.confirmPassword}
					required
					disabled={isLoading}
				/>

				<div class="pt-4">
					<Button
						variant="primary"
						class="w-full"
						onclick={handleRegister}
						disabled={isLoading}
					>
						{isLoading ? 'Creating Account...' : 'Create Account'}
					</Button>
				</div>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-arcana-text-muted">
					Already have an account?
					<a
						href="/auth/login"
						class="text-arcana-gold-600 hover:text-arcana-gold-500 transition-colors ml-1"
					>
						Login
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
