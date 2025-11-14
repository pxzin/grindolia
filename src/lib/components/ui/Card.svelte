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
		default: 'bg-arcana-bg-secondary border border-arcana-border-default shadow-xl',
		elevated: 'bg-arcana-bg-elevated border border-arcana-border-glow shadow-2xl',
		outlined: 'bg-transparent border-2 border-arcana-border-default',
		gold: 'bg-arcana-bg-secondary border-2 border-arcana-gold-600 shadow-xl'
	};

	const paddingClasses = {
		none: 'p-0',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	const baseClasses = 'rounded-2xl backdrop-blur-sm';
</script>

<div class="{baseClasses} {variantClasses[variant]} {paddingClasses[padding]} {className}">
	{@render children?.()}
</div>
