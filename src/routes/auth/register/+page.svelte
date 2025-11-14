<script lang="ts">
	/**
	 * Register Page
	 * New user registration interface
	 */

	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let email = $state('');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);

	function validateForm(): string | null {
		if (!email || !username || !password || !confirmPassword) {
			return 'Please fill in all fields';
		}

		if (password !== confirmPassword) {
			return 'Passwords do not match';
		}

		if (password.length < 8) {
			return 'Password must be at least 8 characters';
		}

		// Check password complexity
		const hasUpperCase = /[A-Z]/.test(password);
		const hasLowerCase = /[a-z]/.test(password);
		const hasNumber = /[0-9]/.test(password);

		if (!hasUpperCase || !hasLowerCase || !hasNumber) {
			return 'Password must contain uppercase, lowercase, and number';
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return 'Please enter a valid email address';
		}

		return null;
	}

	async function handleRegister() {
		const validationError = validateForm();
		if (validationError) {
			error = validationError;
			return;
		}

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					username,
					password
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Auto-login after successful registration
				const loginResponse = await fetch('/api/auth/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password })
				});

				if (loginResponse.ok) {
					goto('/character/create');
				} else {
					// Registration succeeded but login failed, redirect to login page
					goto('/auth/login');
				}
			} else {
				error = data.error || 'Registration failed';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error('Registration error:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleRegister();
		}
	}
</script>

<div class="register-page">
	<div class="register-container">
		<Card variant="elevated" padding="lg">
			<div class="register-header">
				<h1 class="register-title">Create Account</h1>
				<p class="register-subtitle">Begin your adventure in the fantasy world</p>
			</div>

			<form class="register-form" onsubmit={(e) => e.preventDefault()}>
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
					<label for="username">Username</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						onkeypress={handleKeyPress}
						placeholder="Choose a username"
						class="form-input"
						disabled={isLoading}
						autocomplete="username"
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						onkeypress={handleKeyPress}
						placeholder="Min 8 chars, uppercase, lowercase, number"
						class="form-input"
						disabled={isLoading}
						autocomplete="new-password"
					/>
				</div>

				<div class="form-group">
					<label for="confirm-password">Confirm Password</label>
					<input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						onkeypress={handleKeyPress}
						placeholder="Re-enter your password"
						class="form-input"
						disabled={isLoading}
						autocomplete="new-password"
					/>
				</div>

				<Button
					variant="primary"
					size="lg"
					onclick={handleRegister}
					disabled={isLoading}
					class="register-button"
				>
					{isLoading ? 'Creating account...' : 'Register'}
				</Button>

				<div class="register-footer">
					<p class="footer-text">
						Already have an account?
						<a href="/auth/login" class="link">Login</a>
					</p>
					<a href="/demo" class="link">Back to Demo</a>
				</div>
			</form>
		</Card>
	</div>
</div>

<style>
	.register-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, var(--color-primary-1), var(--color-primary-2));
		padding: 2rem;
	}

	.register-container {
		width: 100%;
		max-width: 420px;
	}

	.register-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.register-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 0.5rem;
	}

	.register-subtitle {
		font-size: 1rem;
		color: var(--color-gray-11);
	}

	.register-form {
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

	.register-footer {
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
		.register-page {
			padding: 1rem;
		}

		.register-title {
			font-size: 1.5rem;
		}
	}
</style>
