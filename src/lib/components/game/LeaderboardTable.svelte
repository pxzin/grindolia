<script lang="ts">
	/**
	 * LeaderboardTable Component
	 * Displays ranked players in a table format
	 */
	import { Trophy, Crown, Medal } from 'lucide-svelte';
	import type { LeaderboardEntry, LeaderboardCategory } from '$lib/stores/leaderboard.svelte';

	interface Props {
		entries: LeaderboardEntry[];
		category: LeaderboardCategory;
		playerCharacterId?: number;
	}

	let { entries, category, playerCharacterId }: Props = $props();

	const rankIcons = {
		1: Crown,
		2: Trophy,
		3: Medal
	};

	const rankColors = {
		1: 'text-arcana-gold-400',
		2: 'text-gray-400',
		3: 'text-arcana-orange-600'
	};

	function getRankDisplay(rank: number): string {
		if (rank % 100 >= 11 && rank % 100 <= 13) {
			return `${rank}th`;
		}
		switch (rank % 10) {
			case 1:
				return `${rank}st`;
			case 2:
				return `${rank}nd`;
			case 3:
				return `${rank}rd`;
			default:
				return `${rank}th`;
		}
	}

	function getCategoryValue(entry: LeaderboardEntry, cat: LeaderboardCategory): number {
		switch (cat) {
			case 'level':
				return entry.level;
			case 'combatPower':
				return entry.combatPower;
			case 'dungeonFloor':
				return entry.maxFloorReached;
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
</script>

<div class="overflow-x-auto">
	<table class="w-full">
		<thead>
			<tr class="border-b border-arcana-border-default">
				<th class="text-left p-4 text-sm font-semibold text-arcana-text-secondary">Rank</th>
				<th class="text-left p-4 text-sm font-semibold text-arcana-text-secondary">Character</th>
				<th class="text-left p-4 text-sm font-semibold text-arcana-text-secondary">Class</th>
				<th class="text-right p-4 text-sm font-semibold text-arcana-text-secondary">
					{getCategoryLabel(category)}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each entries as entry, index}
				{@const rank = index + 1}
				{@const RankIcon = rankIcons[rank as keyof typeof rankIcons]}
				{@const isPlayer = entry.characterId === playerCharacterId}
				<tr
					class="border-b border-arcana-border-default hover:bg-arcana-bg-elevated transition-colors {isPlayer
						? 'bg-arcana-gold-600/10'
						: ''}"
				>
					<td class="p-4">
						<div class="flex items-center gap-2">
							{#if RankIcon}
								<RankIcon size={20} class={rankColors[rank as keyof typeof rankColors]} />
							{/if}
							<span
								class="font-mono text-sm {rank <= 3 ? rankColors[rank as keyof typeof rankColors] : 'text-arcana-text-muted'}"
							>
								{getRankDisplay(rank)}
							</span>
						</div>
					</td>
					<td class="p-4">
						<div>
							<div class="font-semibold text-arcana-text-primary">
								{entry.characterName}
								{#if isPlayer}
									<span class="ml-2 text-xs text-arcana-gold-600">(You)</span>
								{/if}
							</div>
							<div class="text-xs text-arcana-text-muted">@{entry.playerUsername}</div>
						</div>
					</td>
					<td class="p-4">
						<span class="text-sm text-arcana-text-secondary">{entry.className}</span>
					</td>
					<td class="p-4 text-right">
						<span class="font-mono font-semibold text-arcana-text-primary">
							{getCategoryValue(entry, category).toLocaleString()}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if entries.length === 0}
		<div class="text-center py-12">
			<p class="text-arcana-text-muted">No leaderboard data available</p>
		</div>
	{/if}
</div>
