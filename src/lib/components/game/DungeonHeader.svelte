<script lang="ts">
	/**
	 * DungeonHeader Component
	 * Displays current dungeon floor info and status
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import { Skull } from 'lucide-svelte';

	interface Props {
		dungeonName?: string;
		currentFloor: number;
		maxFloor: number;
		monstersDefeated?: number;
		monstersTotal?: number;
		recommendedLevel?: number;
		class?: string;
	}

	let {
		dungeonName = 'Dark Dungeon',
		currentFloor,
		maxFloor,
		monstersDefeated = 0,
		monstersTotal = 5,
		recommendedLevel,
		class: className = ''
	}: Props = $props();

	const canDescend = $derived(monstersDefeated >= monstersTotal);
</script>

<Card variant="elevated" class={className}>
	<div class="flex justify-between items-start mb-4">
		<div>
			<h2 class="text-2xl font-serif text-arcana-gold-400 mb-1">{dungeonName}</h2>
			<p class="text-sm text-arcana-text-secondary">
				Floor {currentFloor} of {maxFloor}
			</p>
		</div>
		<div class="text-right">
			<div class="text-sm text-arcana-text-secondary mb-1">Monsters Defeated</div>
			<div class="text-xl font-mono text-arcana-text-primary">
				{monstersDefeated} / {monstersTotal}
			</div>
		</div>
	</div>

	{#if recommendedLevel}
		<div class="flex items-center gap-2 text-sm pt-4 border-t border-arcana-border-default">
			<Skull size={16} class="text-arcana-orange-600" />
			<span class="text-arcana-text-muted">Recommended Level: {recommendedLevel}</span>
		</div>
	{/if}

	{#if canDescend && currentFloor < maxFloor}
		<div class="mt-4 p-3 bg-arcana-green-600/10 border border-arcana-green-600/30 rounded-xl">
			<p class="text-sm text-arcana-green-500">✓ Floor cleared! You can now descend.</p>
		</div>
	{/if}
</Card>
