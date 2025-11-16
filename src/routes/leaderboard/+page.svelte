<script lang="ts">
	/**
	 * Leaderboard Page
	 * View top players across different categories
	 */
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import LeaderboardTabs from '$lib/components/game/LeaderboardTabs.svelte';
	import LeaderboardTable from '$lib/components/game/LeaderboardTable.svelte';
	import PlayerRankCard from '$lib/components/game/PlayerRankCard.svelte';
	import { leaderboardStore, type LeaderboardCategory } from '$lib/stores/leaderboard.svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import { RefreshCw } from 'lucide-svelte';

	let selectedCategory = $state<LeaderboardCategory>('level');
	let refreshing = $state(false);

	const character = $derived(characterStore.character);
	const entries = $derived(leaderboardStore.entries);
	const loading = $derived(leaderboardStore.loading);
	const error = $derived(leaderboardStore.error);
	const playerRank = $derived(leaderboardStore.playerRank);

	async function loadLeaderboard(category: LeaderboardCategory) {
		selectedCategory = category;
		leaderboardStore.setCategory(category);
		await leaderboardStore.fetchLeaderboard(category, character?.id);
	}

	async function handleRefresh() {
		refreshing = true;
		await leaderboardStore.fetchLeaderboard(selectedCategory, character?.id);
		refreshing = false;
	}

	onMount(() => {
		loadLeaderboard('level');
	});

	function getCategoryValue(cat: LeaderboardCategory): number {
		if (!character) return 0;
		switch (cat) {
			case 'level':
				return character.level;
			case 'combatPower':
				return (
					(character.stats.strength +
						character.stats.intelligence +
						character.stats.dexterity) *
						character.level +
					character.stats.vitality * 2
				);
			case 'dungeonFloor':
				return 0; // TODO: Get from dungeon progress
		}
	}
</script>

<div
	class="min-h-screen bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-4 md:p-8"
>
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h1 class="text-4xl font-serif text-arcana-gold-400 mb-2">Leaderboards</h1>
					<p class="text-arcana-text-secondary">Compete with the best adventurers</p>
				</div>
				<Button
					variant="secondary"
					onclick={handleRefresh}
					disabled={loading || refreshing}
					class="flex items-center gap-2"
				>
					<RefreshCw size={16} class={refreshing ? 'animate-spin' : ''} />
					Refresh
				</Button>
			</div>
		</div>

		<!-- Category Tabs -->
		<LeaderboardTabs selected={selectedCategory} onSelect={loadLeaderboard} />

		<!-- Player Rank Card -->
		{#if character && playerRank !== null}
			<PlayerRankCard
				rank={playerRank}
				category={selectedCategory}
				characterName={character.name}
				categoryValue={getCategoryValue(selectedCategory)}
			/>
		{/if}

		<!-- Leaderboard Table -->
		<Card variant="elevated">
			{#if loading && entries.length === 0}
				<div class="space-y-4 p-4">
					{#each Array(10) as _}
						<div class="flex items-center gap-4">
							<Skeleton variant="circular" width="40px" height="40px" />
							<div class="flex-1">
								<Skeleton variant="text" width="200px" />
								<Skeleton variant="text" width="120px" />
							</div>
							<Skeleton variant="text" width="80px" />
						</div>
					{/each}
				</div>
			{:else if error}
				<div class="text-center py-12">
					<p class="text-arcana-orange-600 mb-4">{error}</p>
					<Button variant="primary" onclick={handleRefresh}>Try Again</Button>
				</div>
			{:else}
				<LeaderboardTable
					{entries}
					category={selectedCategory}
					playerCharacterId={character?.id}
				/>
			{/if}
		</Card>

		<!-- Last Update Info -->
		{#if leaderboardStore.lastUpdate > 0}
			<p class="text-xs text-arcana-text-muted text-center mt-4">
				Last updated: {new Date(leaderboardStore.lastUpdate).toLocaleTimeString()}
			</p>
		{/if}
	</div>
</div>

<style>
	.bg-gradient-radial {
		background: radial-gradient(
			ellipse at center,
			var(--color-arcana-bg-primary),
			rgba(93, 106, 184, 0.05),
			var(--color-arcana-bg-primary)
		);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
