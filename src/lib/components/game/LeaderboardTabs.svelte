<script lang="ts">
	/**
	 * LeaderboardTabs Component
	 * Category tabs for leaderboard selection
	 */
	import { TrendingUp, Zap, ArrowDown } from 'lucide-svelte';
	import type { LeaderboardCategory } from '$lib/stores/leaderboard.svelte';

	interface Props {
		selected: LeaderboardCategory;
		onSelect: (category: LeaderboardCategory) => void;
	}

	let { selected, onSelect }: Props = $props();

	const tabs = [
		{
			id: 'level' as LeaderboardCategory,
			label: 'Level',
			icon: TrendingUp,
			description: 'Top players by level'
		},
		{
			id: 'combatPower' as LeaderboardCategory,
			label: 'Combat Power',
			icon: Zap,
			description: 'Strongest fighters'
		},
		{
			id: 'dungeonFloor' as LeaderboardCategory,
			label: 'Dungeon Progress',
			icon: ArrowDown,
			description: 'Deepest explorers'
		}
	];
</script>

<div class="flex flex-col md:flex-row gap-4 mb-6">
	{#each tabs as tab}
		{@const isSelected = selected === tab.id}
		<button
			onclick={() => onSelect(tab.id)}
			class="flex-1 p-4 rounded-xl border-2 transition-all {isSelected
				? 'border-arcana-gold-600 bg-arcana-gold-600/10'
				: 'border-arcana-border-default bg-arcana-bg-secondary hover:border-arcana-gold-600/50 hover:bg-arcana-bg-elevated'}"
		>
			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-lg flex items-center justify-center {isSelected
						? 'bg-arcana-gold-600/20 text-arcana-gold-400'
						: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
				>
					<tab.icon size={20} />
				</div>
				<div class="text-left">
					<div
						class="font-semibold {isSelected ? 'text-arcana-gold-400' : 'text-arcana-text-primary'}"
					>
						{tab.label}
					</div>
					<div class="text-xs text-arcana-text-muted">{tab.description}</div>
				</div>
			</div>
		</button>
	{/each}
</div>
