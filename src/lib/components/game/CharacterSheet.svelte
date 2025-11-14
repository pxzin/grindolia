<script lang="ts">
	/**
	 * CharacterSheet Component
	 * Displays character information including stats, HP, XP, and gold
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import StatDisplay from '$lib/components/ui/StatDisplay.svelte';
	import { Coins } from 'lucide-svelte';

	interface Character {
		name: string;
		class: string;
		level: number;
		hp: { current: number; max: number };
		xp: { current: number; max: number };
		stats: {
			strength: number;
			intelligence: number;
			dexterity: number;
			vitality: number;
		};
		gold: number;
	}

	interface Props {
		character: Character;
		class?: string;
	}

	let { character, class: className = '' }: Props = $props();

	const classColors: Record<string, string> = {
		warrior: 'rgba(255, 107, 53, 1)', // orange-600
		mage: 'rgba(42, 157, 143, 1)', // cyan-600
		rogue: 'rgba(67, 160, 71, 1)', // green-600
		cleric: 'rgba(217, 70, 239, 1)' // purple-600
	};

	const classColor = $derived(classColors[character.class.toLowerCase()] || 'rgba(201, 152, 74, 1)');
</script>

<Card variant="elevated" class="h-full {className}">
	<div class="flex flex-col h-full">
		<!-- Character Portrait -->
		<div class="mb-6">
			<div class="relative w-32 h-32 mx-auto mb-4">
				<div
					class="w-full h-full rounded-xl border-2 flex items-center justify-center text-6xl font-serif"
					style="border-color: {classColor}; box-shadow: 0 0 20px {classColor}40; background: linear-gradient(135deg, {classColor}20, {classColor}10)"
				>
					{character.name.charAt(0).toUpperCase()}
				</div>
				<div
					class="absolute -top-2 -right-2 w-10 h-10 rounded-full border-2 border-arcana-bg-secondary flex items-center justify-center text-sm font-bold"
					style="background-color: {classColor}"
				>
					{character.level}
				</div>
			</div>

			<div class="text-center">
				<h3 class="text-xl font-serif text-arcana-gold-400 mb-1">
					{character.name}
				</h3>
				<p class="text-sm text-arcana-text-secondary capitalize">
					Level {character.level}
					{character.class}
				</p>
			</div>
		</div>

		<!-- Progress Bars -->
		<div class="space-y-4 mb-6">
			<ProgressBar current={character.hp.current} max={character.hp.max} type="hp" size="thick" />
			<ProgressBar current={character.xp.current} max={character.xp.max} type="xp" size="thick" />
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-3 mb-6">
			<StatDisplay label="Strength" value={character.stats.strength} variant="compact" />
			<StatDisplay label="Intelligence" value={character.stats.intelligence} variant="compact" />
			<StatDisplay label="Dexterity" value={character.stats.dexterity} variant="compact" />
			<StatDisplay label="Vitality" value={character.stats.vitality} variant="compact" />
		</div>

		<!-- Gold -->
		<div class="mt-auto pt-4 border-t border-arcana-border-default">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Coins size={20} class="text-arcana-gold-600" />
					<span class="text-sm text-arcana-text-muted">Gold</span>
				</div>
				<span class="text-xl font-mono text-arcana-gold-400">
					{character.gold.toLocaleString()}
				</span>
			</div>
		</div>
	</div>
</Card>
