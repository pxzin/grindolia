<script lang="ts">
	/**
	 * CombatantCard Component
	 * Displays combatant info (player or monster) with HP and abilities
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { Sword, Shield, Skull } from 'lucide-svelte';

	interface Props {
		name: string;
		level: number;
		type: 'player' | 'monster';
		hp: { current: number; max: number };
		attack: number;
		defense: number;
		className?: string;
		class?: string;
	}

	let {
		name,
		level,
		type,
		hp,
		attack,
		defense,
		className,
		class: customClass = ''
	}: Props = $props();

	const isPlayer = type === 'player';
	const borderColor = isPlayer ? 'border-arcana-gold-600/30' : 'border-arcana-orange-600/30';
	const iconColor = isPlayer ? 'text-arcana-gold-600' : 'text-arcana-orange-600';
	const nameColor = isPlayer ? 'text-arcana-gold-400' : 'text-arcana-orange-600';
	const glowColor = isPlayer
		? 'shadow-[0_0_20px_rgba(201,152,74,0.4)]'
		: 'shadow-[0_0_20px_rgba(255,107,53,0.4)]';
</script>

<Card variant="elevated" class="border-2 {borderColor} {customClass}">
	<div class="text-center mb-4">
		<div
			class="w-24 h-24 mx-auto mb-4 rounded-xl border-2 {isPlayer
				? 'border-arcana-gold-600'
				: 'border-arcana-orange-600'} flex items-center justify-center bg-gradient-to-br {isPlayer
				? 'from-arcana-gold-600/20 to-arcana-gold-600/10'
				: 'from-arcana-orange-600/20 to-arcana-orange-600/10'} {glowColor}"
		>
			{#if isPlayer}
				<span class="text-4xl font-serif">{name.charAt(0).toUpperCase()}</span>
			{:else}
				<Skull size={48} class={iconColor} />
			{/if}
		</div>

		<h3 class="text-2xl font-serif {nameColor} mb-1">
			{name}
		</h3>
		<p class="text-sm text-arcana-text-secondary">
			Level {level} {isPlayer && className ? className : 'Monster'}
		</p>
	</div>

	<div class="mb-4">
		<ProgressBar current={hp.current} max={hp.max} type="hp" size="thick" />
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div class="bg-black/10 rounded-lg p-3 text-center">
			<Sword size={20} class="mx-auto mb-1 {iconColor}" />
			<div class="text-xs text-arcana-text-muted">Attack</div>
			<div class="text-lg font-mono text-arcana-text-primary">{attack}</div>
		</div>
		<div class="bg-black/10 rounded-lg p-3 text-center">
			<Shield size={20} class="mx-auto mb-1 text-arcana-cyan-600" />
			<div class="text-xs text-arcana-text-muted">Defense</div>
			<div class="text-lg font-mono text-arcana-text-primary">{defense}</div>
		</div>
	</div>
</Card>
