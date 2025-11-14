<script lang="ts">
	/**
	 * Card Component
	 * Container with border and padding
	 */

	interface Props {
		variant?: 'default' | 'elevated' | 'outlined';
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
		default: 'bg-gray-2 border border-gray-6',
		elevated: 'bg-gray-2 shadow-lg',
		outlined: 'bg-transparent border-2 border-gray-6'
	};

	const paddingClasses = {
		none: 'p-0',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};

	const baseClasses = 'rounded-lg';
</script>

<div class="{baseClasses} {variantClasses[variant]} {paddingClasses[padding]} {className}">
	{@render children?.()}
</div>
