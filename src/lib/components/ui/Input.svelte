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
		'w-full px-4 py-3 rounded-2xl border-2 bg-arcana-bg-elevated text-arcana-text-primary transition-all duration-300 font-sans';
	const normalClasses =
		'border-arcana-border-default focus:outline-none focus:ring-2 focus:ring-arcana-gold-600 focus:border-arcana-gold-600 focus:shadow-[0_0_20px_rgba(201,152,74,0.2)] placeholder:text-arcana-text-muted';
	const errorClasses = 'border-arcana-orange-600 focus:outline-none focus:ring-2 focus:ring-arcana-orange-600 focus:shadow-[0_0_20px_rgba(255,107,53,0.2)]';
	const disabledClasses = 'opacity-50 cursor-not-allowed';
</script>

<div class="input-wrapper {className}">
	{#if label}
		<label class="block text-sm font-medium text-arcana-text-primary mb-2">
			{label}
			{#if required}
				<span class="text-arcana-orange-600">*</span>
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
		<p class="mt-1 text-sm text-arcana-orange-600">{error}</p>
	{/if}
</div>
