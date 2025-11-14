<script lang="ts">
	/**
	 * ProgressBar Component
	 * Animated progress bar for HP, Mana, and XP with gradients
	 */

	interface Props {
		current: number;
		max: number;
		type: 'hp' | 'mana' | 'xp';
		showLabel?: boolean;
		size?: 'thin' | 'thick';
		class?: string;
	}

	let {
		current,
		max,
		type,
		showLabel = true,
		size = 'thin',
		class: className = ''
	}: Props = $props();

	const percentage = $derived(Math.min((current / max) * 100, 100));

	const gradients = {
		hp: 'bg-gradient-to-r from-arcana-orange-600 to-arcana-orange-500',
		mana: 'bg-gradient-to-r from-arcana-cyan-600 to-arcana-cyan-400',
		xp: 'bg-gradient-to-r from-arcana-green-600 to-arcana-green-400'
	};

	const labels = {
		hp: 'HP',
		mana: 'Mana',
		xp: 'XP'
	};

	const sizes = {
		thin: 'h-2',
		thick: 'h-4'
	};
</script>

<div class="w-full {className}">
	{#if showLabel}
		<div class="flex justify-between mb-2 text-sm text-arcana-text-secondary">
			<span>{labels[type]}</span>
			<span class="font-mono">{current} / {max}</span>
		</div>
	{/if}
	<div
		class="w-full bg-black/30 rounded-full overflow-hidden {sizes[size]} shadow-inner border border-arcana-border-default/50"
	>
		<div
			class="{gradients[type]} {sizes[
				size
			]} rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
			style="width: {percentage}%"
		/>
	</div>
</div>
