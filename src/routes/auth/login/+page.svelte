<script lang="ts">
	/**
	 * Login Page
	 * User authentication interface
	 */

	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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
				// Redirect to character selection/creation
				goto('/character/create');
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

<div class="login-page">
	<div class="login-container">
		<Card variant="elevated" padding="lg">
			<div class="login-header">
				<h1 class="login-title">Welcome Back</h1>
				<p class="login-subtitle">Login to continue your adventure</p>
			</div>

			<form class="login-form" onsubmit={(e) => e.preventDefault()}>
				{#if error}
					<div class="error-message">
						<p>{error}</p>
					</div>
				{/if}

				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						onkeypress={handleKeyPress}
						placeholder="your@email.com"
						class="form-input"
						disabled={isLoading}
						autocomplete="email"
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						onkeypress={handleKeyPress}
						placeholder="••••••••"
						class="form-input"
						disabled={isLoading}
						autocomplete="current-password"
					/>
				</div>

				<Button
					variant="primary"
					size="lg"
					onclick={handleLogin}
					disabled={isLoading}
					class="login-button"
				>
					{isLoading ? 'Logging in...' : 'Login'}
				</Button>

				<div class="login-footer">
					<p class="footer-text">
						Don't have an account?
						<a href="/auth/register" class="link">Register</a>
					</p>
					<a href="/demo" class="link">Back to Demo</a>
				</div>
			</form>
		</Card>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, var(--color-primary-1), var(--color-primary-2));
		padding: 2rem;
	}

	.login-container {
		width: 100%;
		max-width: 420px;
	}

	.login-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.login-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 0.5rem;
	}

	.login-subtitle {
		font-size: 1rem;
		color: var(--color-gray-11);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.error-message {
		background: var(--color-red-3);
		border: 1px solid var(--color-red-6);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.error-message p {
		color: var(--color-red-11);
		margin: 0;
		font-size: 0.875rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-12);
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-gray-1);
		border: 1px solid var(--color-gray-6);
		border-radius: 0.375rem;
		color: var(--color-gray-12);
		font-size: 1rem;
		transition: all 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-8);
		box-shadow: 0 0 0 3px var(--color-primary-4);
	}

	.form-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.login-footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid var(--color-gray-6);
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--color-gray-11);
		margin: 0;
	}

	.link {
		color: var(--color-primary-11);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.link:hover {
		color: var(--color-primary-12);
		text-decoration: underline;
	}

	@media (max-width: 640px) {
		.login-page {
			padding: 1rem;
		}

		.login-title {
			font-size: 1.5rem;
		}
	}
</style>
