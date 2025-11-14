<script lang="ts">
	/**
	 * Dungeon Page
	 * Main dungeon exploration interface
	 */

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { dungeonStore } from '$lib/stores/dungeon.svelte';
	import { combatStore } from '$lib/stores/combat.svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import DungeonView from '$lib/components/dungeon/DungeonView.svelte';
	import CombatArena from '$lib/components/combat/CombatArena.svelte';
	import CharacterSheet from '$lib/components/character/CharacterSheet.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// Make reactive references to store state using $derived
	const character = $derived(characterStore.state);
	const dungeon = $derived(dungeonStore.state);
	const combat = $derived(combatStore.state);

	let dungeonList = $state<any[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		// Try to load character from server if not already loaded
		if (!characterStore.isLoaded) {
			const loaded = await characterStore.loadCharacter();
			if (!loaded) {
				// No character found, redirect to create
				goto('/character/create');
				return;
			}
		}

		// Load available dungeons
		try {
			const response = await fetch('/api/dungeon');
			if (!response.ok) {
				throw new Error('Failed to load dungeons');
			}

			const data = await response.json();
			dungeonList = data.dungeons;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load dungeons';
			console.error('Failed to load dungeons:', err);
		} finally {
			isLoading = false;
		}
	});

	async function handleEnterDungeon(dungeonId: number) {
		console.log('🎮 [DungeonPage] handleEnterDungeon called', { dungeonId, characterId: character.id });

		if (!character.id) {
			console.error('❌ [DungeonPage] No character ID!');
			return;
		}

		try {
			console.log('🎮 [DungeonPage] Calling dungeonStore.enterDungeon...');
			await dungeonStore.enterDungeon(character.id, dungeonId);
			console.log('✅ [DungeonPage] Successfully entered dungeon');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to enter dungeon';
			console.error('❌ [DungeonPage] Failed to enter dungeon:', err);
		}
	}

	function handleExitDungeon() {
		dungeonStore.exitDungeon();
		combatStore.endCombat();
	}
</script>

<div class="dungeon-page container mx-auto px-4 py-8">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Character Sheet Sidebar -->
		<div class="lg:col-span-1">
			{#if characterStore.isLoaded}
				<CharacterSheet
					name={character.name}
					className={character.class}
					level={character.level}
					hp={character.hp}
					maxHp={character.maxHp}
					xp={character.xp}
					xpToNextLevel={characterStore.xpToNextLevel}
					stats={character.stats}
					currency={character.currency}
				/>
			{/if}
		</div>

		<!-- Main Content -->
		<div class="lg:col-span-2">
			{#if isLoading}
				<Card variant="elevated" padding="lg">
					<p class="text-center text-gray-11">Loading dungeons...</p>
				</Card>
			{:else if error}
				<Card variant="elevated" padding="lg">
					<p class="text-center text-red-11">{error}</p>
				</Card>
			{:else if !dungeonStore.isInDungeon}
				<!-- Dungeon Selection -->
				<Card variant="elevated" padding="lg">
					<h2 class="text-2xl font-bold text-gray-12 mb-6">Choose Your Dungeon</h2>

					<div class="space-y-4">
						{#each dungeonList as dungeon}
							<Card variant="outlined" padding="md">
								<div class="flex justify-between items-start mb-3">
									<div>
										<h3 class="text-lg font-semibold text-gray-12">{dungeon.name}</h3>
										<p class="text-sm text-gray-11 mt-1">{dungeon.description}</p>
									</div>
								</div>

								<div class="flex justify-between items-center">
									<div class="text-sm text-gray-11">
										<span>Min Level: {dungeon.min_level}</span>
										<span class="mx-2">•</span>
										<span>{dungeon.max_floors} Floors</span>
									</div>

									<Button
										onclick={() => handleEnterDungeon(dungeon.id)}
										variant="primary"
										size="sm"
									>
										Enter
									</Button>
								</div>
							</Card>
						{/each}
					</div>
				</Card>
			{:else}
				<!-- In Dungeon -->
				<div class="space-y-6">
					<!-- Exit Button -->
					<div class="flex justify-end">
						<Button onclick={handleExitDungeon} variant="secondary" size="sm">
							Exit Dungeon
						</Button>
					</div>

					<!-- Combat or Exploration -->
					{#if combat.isInCombat}
						<CombatArena
							characterId={character.id || 0}
							characterName={character.name}
							characterHP={character.hp}
							characterMaxHP={character.maxHp}
						/>
					{:else}
						<DungeonView characterId={character.id || 0} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.dungeon-page {
		min-height: 100vh;
	}
</style>
