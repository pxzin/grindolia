<script lang="ts">
	/**
	 * Button Component
	 * Base button with variants and sizes
	 */

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children?: any;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		onclick,
		children,
		class: className = ''
	}: Props = $props();

	const variantClasses = {
		primary: 'bg-arcana-gold-600 text-arcana-bg-primary hover:bg-arcana-gold-500 active:bg-arcana-gold-700 border-2 border-arcana-gold-800',
		secondary: 'bg-arcana-bg-elevated text-arcana-text-primary hover:bg-arcana-bg-secondary active:bg-arcana-bg-primary border-2 border-arcana-border-default',
		danger: 'bg-arcana-orange-600 text-white hover:bg-arcana-orange-500 active:bg-arcana-orange-700 border-2 border-arcana-orange-800',
		destructive: 'bg-arcana-orange-600 text-white hover:bg-arcana-orange-500 active:bg-arcana-orange-700 border-2 border-arcana-orange-800',
		ghost: 'bg-transparent text-arcana-text-primary hover:bg-arcana-bg-secondary active:bg-arcana-bg-elevated border-2 border-transparent'
	};

	const sizeClasses = {
		sm: 'px-4 py-2 text-sm',
		md: 'px-6 py-3 text-base',
		lg: 'px-8 py-4 text-lg'
	};

	const baseClasses =
		'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-arcana-gold-600 focus:ring-offset-2 focus:ring-offset-arcana-bg-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
</script>

<button
	{type}
	{disabled}
	onclick={onclick}
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
	{@render children?.()}
</button>
