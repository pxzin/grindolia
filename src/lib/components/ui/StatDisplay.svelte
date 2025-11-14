<script lang="ts">
	/**
	 * StatDisplay Component
	 * Displays a single stat with label and value
	 */

	interface Props {
		label: string;
		value: number | string;
		variant?: 'default' | 'compact';
		class?: string;
	}

	let { label, value, variant = 'default', class: className = '' }: Props = $props();

	const formattedValue = $derived(typeof value === 'number' ? value.toLocaleString() : value);
</script>

{#if variant === 'compact'}
	<div class="bg-black/10 rounded-lg p-3 {className}">
		<div class="text-xs text-arcana-text-muted mb-1">{label}</div>
		<div class="text-xl font-mono text-arcana-text-primary">{formattedValue}</div>
	</div>
{:else}
	<div class="bg-arcana-bg-elevated/50 rounded-xl p-4 border border-arcana-border-default {className}">
		<div class="text-sm text-arcana-text-secondary mb-2">{label}</div>
		<div class="text-2xl font-mono text-arcana-text-primary">{formattedValue}</div>
	</div>
{/if}
