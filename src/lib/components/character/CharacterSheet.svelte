<script lang="ts">
	/**
	 * CharacterSheet Component
	 * Display character stats, HP, XP
	 */

	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		name: string;
		className: string;
		level: number;
		hp: number;
		maxHp: number;
		xp: number;
		xpToNextLevel: number;
		stats: {
			strength: number;
			intelligence: number;
			dexterity: number;
			vitality: number;
		};
		currency: number;
	}

	let { name, className, level, hp, maxHp, xp, xpToNextLevel, stats, currency }: Props = $props();

	const hpPercentage = $derived((hp / maxHp) * 100);
	const xpPercentage = $derived((xp / xpToNextLevel) * 100);

	console.log('🎮 [CharacterSheet] Rendered with props:', {
		name,
		className,
		level,
		hp,
		maxHp,
		xp,
		xpToNextLevel,
		stats,
		currency
	});
</script>

<Card variant="outlined" padding="md">
	<div class="character-sheet">
		<!-- Character Header -->
		<div class="mb-4">
			<h3 class="text-xl font-bold text-gray-12">{name}</h3>
			<p class="text-sm text-gray-11">{className} - Level {level}</p>
		</div>

		<!-- HP Bar -->
		<div class="mb-4">
			<div class="flex justify-between text-sm mb-1">
				<span class="text-gray-11 font-medium">HP</span>
				<span class="text-gray-11">{hp} / {maxHp}</span>
			</div>
			<div class="w-full bg-gray-6 rounded-full h-2">
				<div
					class="bg-green-9 h-2 rounded-full transition-all"
					style="width: {hpPercentage}%"
				></div>
			</div>
		</div>

		<!-- XP Bar -->
		<div class="mb-4">
			<div class="flex justify-between text-sm mb-1">
				<span class="text-gray-11 font-medium">XP</span>
				<span class="text-gray-11">{xp} / {xpToNextLevel}</span>
			</div>
			<div class="w-full bg-gray-6 rounded-full h-2">
				<div class="bg-blue-9 h-2 rounded-full transition-all" style="width: {xpPercentage}%"></div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-3 mb-4">
			<div class="stat-item">
				<span class="text-gray-11 text-sm">Strength</span>
				<span class="text-gray-12 font-semibold">{stats.strength}</span>
			</div>
			<div class="stat-item">
				<span class="text-gray-11 text-sm">Intelligence</span>
				<span class="text-gray-12 font-semibold">{stats.intelligence}</span>
			</div>
			<div class="stat-item">
				<span class="text-gray-11 text-sm">Dexterity</span>
				<span class="text-gray-12 font-semibold">{stats.dexterity}</span>
			</div>
			<div class="stat-item">
				<span class="text-gray-11 text-sm">Vitality</span>
				<span class="text-gray-12 font-semibold">{stats.vitality}</span>
			</div>
		</div>

		<!-- Currency -->
		<div class="pt-3 border-t border-gray-6">
			<div class="flex justify-between items-center">
				<span class="text-gray-11 text-sm">Gold</span>
				<span class="text-yellow-11 font-bold">{currency}</span>
			</div>
		</div>
	</div>
</Card>

<style>
	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 0.375rem;
	}
</style>
