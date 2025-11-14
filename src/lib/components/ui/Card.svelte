<script lang="ts">
	/**
	 * Card Component
	 * Container with border and padding
	 */

	interface Props {
		variant?: 'default' | 'elevated' | 'outlined' | 'gold';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children?: any;
		class?: string;
	}

	let {
		variant = 'default',
		padding = 'md',
		children,
		class: className = ''
	}: Props = $props();

	const variantClasses = {
		default: 'bg-arcana-bg-secondary border border-arcana-border-default shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)]',
		elevated: 'bg-arcana-bg-elevated border border-arcana-border-glow shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]',
		outlined: 'bg-transparent border-2 border-arcana-border-default',
		gold: 'bg-arcana-bg-secondary border-2 border-arcana-gold-600 shadow-[0_0_20px_rgba(201,152,74,0.4)]'
	};

	const paddingClasses = {
		none: 'p-0',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	const baseClasses = 'rounded-3xl backdrop-blur-lg';
</script>

<div class="{baseClasses} {variantClasses[variant]} {paddingClasses[padding]} {className}">
	{@render children?.()}
</div>
