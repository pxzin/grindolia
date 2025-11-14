<script lang="ts">
	/**
	 * Input Component
	 * Text input with label and error states
	 */

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number';
		value?: string | number;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder,
		label,
		error,
		disabled = false,
		required = false,
		oninput,
		onchange,
		class: className = ''
	}: Props = $props();

	const baseClasses =
		'w-full px-3 py-2 rounded-md border bg-gray-1 text-gray-12 transition-colors duration-200';
	const normalClasses =
		'border-gray-7 focus:outline-none focus:ring-2 focus:ring-primary-9 focus:border-transparent';
	const errorClasses = 'border-red-9 focus:outline-none focus:ring-2 focus:ring-red-9';
	const disabledClasses = 'opacity-50 cursor-not-allowed';
</script>

<div class="input-wrapper {className}">
	{#if label}
		<label class="block text-sm font-medium text-gray-12 mb-1">
			{label}
			{#if required}
				<span class="text-red-9">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		bind:value
		{placeholder}
		{disabled}
		{required}
		{oninput}
		{onchange}
		class="{baseClasses} {error
			? errorClasses
			: normalClasses} {disabled ? disabledClasses : ''}"
	/>

	{#if error}
		<p class="mt-1 text-sm text-red-9">{error}</p>
	{/if}
</div>
