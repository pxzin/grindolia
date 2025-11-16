<script lang="ts">
	/**
	 * PlayerRankCard Component
	 * Displays player's current rank in a category
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import { Award } from 'lucide-svelte';
	import type { LeaderboardCategory } from '$lib/stores/leaderboard.svelte';

	interface Props {
		rank: number | null;
		category: LeaderboardCategory;
		characterName: string;
		categoryValue: number;
	}

	let { rank, category, characterName, categoryValue }: Props = $props();

	function getRankDisplay(r: number): string {
		if (r % 100 >= 11 && r % 100 <= 13) {
			return `${r}th`;
		}
		switch (r % 10) {
			case 1:
				return `${r}st`;
			case 2:
				return `${r}nd`;
			case 3:
				return `${r}rd`;
			default:
				return `${r}th`;
		}
	}

	function getCategoryLabel(cat: LeaderboardCategory): string {
		switch (cat) {
			case 'level':
				return 'Level';
			case 'combatPower':
				return 'Combat Power';
			case 'dungeonFloor':
				return 'Floor Reached';
		}
	}

	const isTopRank = $derived(rank !== null && rank <= 10);
</script>

<Card variant={isTopRank ? 'gold' : 'elevated'} class="mb-6">
	<div class="flex items-center gap-4">
		<div
			class="w-16 h-16 rounded-full flex items-center justify-center {isTopRank
				? 'bg-arcana-gold-600/20'
				: 'bg-arcana-bg-elevated'}"
		>
			<Award size={32} class={isTopRank ? 'text-arcana-gold-400' : 'text-arcana-text-secondary'} />
		</div>

		<div class="flex-1">
			<div class="text-sm text-arcana-text-muted mb-1">Your Rank in {getCategoryLabel(category)}</div>
			{#if rank !== null}
				<div class="flex items-baseline gap-3">
					<span
						class="text-3xl font-bold font-mono {isTopRank ? 'text-arcana-gold-400' : 'text-arcana-text-primary'}"
					>
						{getRankDisplay(rank)}
					</span>
					<span class="text-arcana-text-secondary">
						{categoryValue.toLocaleString()}
					</span>
				</div>
				{#if isTopRank}
					<p class="text-xs text-arcana-gold-600 mt-1">🏆 Top 10 Player!</p>
				{/if}
			{:else}
				<p class="text-arcana-text-muted">Not ranked yet</p>
			{/if}
		</div>
	</div>
</Card>
