<script lang="ts">
	/**
	 * Button Component
	 * Base button with variants and sizes
	 */

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
		primary: 'bg-primary-9 text-white hover:bg-primary-10 active:bg-primary-11',
		secondary: 'bg-gray-3 text-gray-12 hover:bg-gray-4 active:bg-gray-5',
		danger: 'bg-red-9 text-white hover:bg-red-10 active:bg-red-11',
		ghost: 'bg-transparent text-gray-12 hover:bg-gray-3 active:bg-gray-4'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	const baseClasses =
		'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-9 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
</script>

<button
	{type}
	{disabled}
	onclick={onclick}
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
	{@render children?.()}
</button>
