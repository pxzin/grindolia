<script lang="ts">
	/**
	 * ClassCard Component
	 * Displays a character class option with icon, description, and stats
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import type { ComponentType } from 'svelte';

	interface ClassStats {
		strength: number;
		intelligence: number;
		dexterity: number;
		vitality: number;
	}

	interface Props {
		id: string;
		name: string;
		description: string;
		icon: ComponentType;
		color: string;
		stats: ClassStats;
		selected?: boolean;
		onclick?: () => void;
		class?: string;
	}

	let {
		id,
		name,
		description,
		icon: Icon,
		color,
		stats,
		selected = false,
		onclick,
		class: className = ''
	}: Props = $props();
</script>

<Card
	variant={selected ? 'gold' : 'default'}
	class="cursor-pointer transition-all duration-300 hover:scale-105 {selected
		? 'ring-2 ring-arcana-gold-600'
		: ''} {className}"
	{onclick}
>
	<div class="flex flex-col items-center text-center">
		<div
			class="mb-4 p-4 rounded-full"
			style="color: {color}; background: {color}20"
		>
			<Icon size={48} />
		</div>

		<h3 class="text-2xl font-serif text-arcana-gold-400 mb-3">
			{name}
		</h3>

		<p class="text-sm text-arcana-text-secondary mb-4 leading-relaxed">
			{description}
		</p>

		<div class="w-full grid grid-cols-2 gap-3 mt-auto">
			<div class="bg-black/10 rounded-lg p-2">
				<div class="text-xs text-arcana-text-muted">Strength</div>
				<div class="text-lg font-mono text-arcana-text-primary">{stats.strength}</div>
			</div>
			<div class="bg-black/10 rounded-lg p-2">
				<div class="text-xs text-arcana-text-muted">Intelligence</div>
				<div class="text-lg font-mono text-arcana-text-primary">{stats.intelligence}</div>
			</div>
			<div class="bg-black/10 rounded-lg p-2">
				<div class="text-xs text-arcana-text-muted">Dexterity</div>
				<div class="text-lg font-mono text-arcana-text-primary">{stats.dexterity}</div>
			</div>
			<div class="bg-black/10 rounded-lg p-2">
				<div class="text-xs text-arcana-text-muted">Vitality</div>
				<div class="text-lg font-mono text-arcana-text-primary">{stats.vitality}</div>
			</div>
		</div>
	</div>
</Card>
