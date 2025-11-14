<script lang="ts">
	/**
	 * Skeleton Component
	 * Loading placeholder with pulse animation
	 */

	interface Props {
		variant?: 'text' | 'circular' | 'rectangular';
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		variant = 'rectangular',
		width = '100%',
		height = variant === 'text' ? '1rem' : '3rem',
		class: className = ''
	}: Props = $props();

	const variantClasses = {
		text: 'rounded',
		circular: 'rounded-full',
		rectangular: 'rounded-xl'
	};
</script>

<div
	class="skeleton {variantClasses[variant]} {className}"
	style="width: {width}; height: {height}"
	role="status"
	aria-label="Loading..."
/>

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			var(--color-arcana-bg-elevated) 0%,
			var(--color-arcana-bg-secondary) 50%,
			var(--color-arcana-bg-elevated) 100%
		);
		background-size: 200% 100%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
