<script lang="ts">
	/**
	 * Dungeon Page
	 * Dark Fantasy dungeon exploration interface
	 */

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { dungeonStore } from '$lib/stores/dungeon.svelte';
	import { combatStore } from '$lib/stores/combat.svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import CombatArena from '$lib/components/combat/CombatArena.svelte';
	import CharacterSheet from '$lib/components/game/CharacterSheet.svelte';
	import DungeonHeader from '$lib/components/game/DungeonHeader.svelte';
	import AdventureLog from '$lib/components/game/AdventureLog.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Sword, Search, ArrowDown, LogOut } from 'lucide-svelte';

	// Get server-side data
	let { data } = $props<{ data: { userId: number; characterId: number } }>();

	// Make reactive references to store state using $derived
	const character = $derived(characterStore.state);
	const dungeon = $derived(dungeonStore.state);
	const combat = $derived(combatStore.state);

	let dungeonList = $state<any[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let adventureMessages = $state<Array<{ text: string; type: 'danger' | 'success' | 'gold' | 'xp' | 'normal' }>>([
		{ text: 'You enter the dark dungeon. The air is thick with ancient magic...', type: 'normal' }
	]);

	// Mock character for CharacterSheet component
	const mockCharacter = $derived({
		name: character.name,
		class: character.class,
		level: character.level,
		hp: { current: character.hp, max: character.maxHp },
		xp: { current: character.xp, max: characterStore.xpToNextLevel },
		stats: character.stats,
		gold: character.currency
	});

	onMount(async () => {
		// Try to load character from server if not already loaded
		if (!characterStore.isLoaded) {
			const loaded = await characterStore.loadCharacter(data.characterId);
			if (!loaded) {
				// No character found, redirect to select
				goto('/character/select');
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
		if (!character.id) {
			console.error('No character ID!');
			return;
		}

		try {
			await dungeonStore.enterDungeon(character.id, dungeonId);
			addMessage('You descend into the depths...', 'normal');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to enter dungeon';
			console.error('Failed to enter dungeon:', err);
		}
	}

	function handleExitDungeon() {
		dungeonStore.exitDungeon();
		combatStore.endCombat();
		addMessage('You return to the surface.', 'normal');
	}

	function addMessage(text: string, type: 'danger' | 'success' | 'gold' | 'xp' | 'normal') {
		adventureMessages = [...adventureMessages, { text, type }].slice(-10);
	}

	async function handleFight() {
		if (!character.id || !dungeon.dungeonProgressId) {
			addMessage('Cannot initiate combat - not in a dungeon', 'danger');
			return;
		}

		try {
			addMessage('A monster appears from the shadows!', 'danger');
			await combatStore.initiateCombat(character.id, dungeon.dungeonProgressId);
			addMessage(`You encounter a ${combat.monster?.name || 'creature'}!`, 'danger');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Failed to initiate combat';
			addMessage(errorMsg, 'danger');
			console.error('Combat initiation error:', err);
		}
	}

	function handleExplore() {
		// For MVP, exploration just adds flavor text
		const discoveries = [
			{ text: 'You search the area but find nothing of interest.', type: 'normal' as const },
			{ text: 'The walls are covered with ancient runes...', type: 'normal' as const },
			{ text: 'You hear distant echoes deeper in the dungeon.', type: 'normal' as const }
		];
		const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
		addMessage(discovery.text, discovery.type);
	}

	async function handleDescend() {
		if (!dungeon.canDescend) {
			addMessage('You must defeat at least one monster before descending.', 'normal');
			return;
		}

		if (dungeon.isLastFloor) {
			addMessage('You have reached the deepest floor!', 'success');
			return;
		}

		try {
			await dungeonStore.descendFloor();
			addMessage(`You descend to floor ${dungeon.currentFloor}...`, 'success');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Failed to descend';
			addMessage(errorMsg, 'danger');
			console.error('Descend error:', err);
		}
	}
</script>

<div class="min-h-screen bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-6">
	<div class="max-w-7xl mx-auto">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left Sidebar - Character Sheet -->
			<div class="lg:col-span-1">
				{#if characterStore.isLoaded}
					<CharacterSheet character={mockCharacter} />
				{/if}
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-2">
				{#if isLoading}
					<Card variant="elevated">
						<p class="text-center text-arcana-text-secondary">Loading dungeons...</p>
					</Card>
				{:else if error}
					<Card variant="elevated">
						<p class="text-center text-arcana-orange-600">{error}</p>
					</Card>
				{:else if !dungeonStore.isInDungeon}
					<!-- Dungeon Selection -->
					<Card variant="elevated">
						<h2 class="text-2xl font-serif text-arcana-gold-400 mb-6">Choose Your Dungeon</h2>

						<div class="space-y-4">
							{#each dungeonList as dungeonItem}
								<Card variant="outlined">
									<div class="flex justify-between items-start mb-3">
										<div>
											<h3 class="text-lg font-semibold text-arcana-text-primary">{dungeonItem.name}</h3>
											<p class="text-sm text-arcana-text-secondary mt-1">{dungeonItem.description}</p>
										</div>
									</div>

									<div class="flex justify-between items-center">
										<div class="text-sm text-arcana-text-muted">
											<span>Min Level: {dungeonItem.min_level}</span>
											<span class="mx-2">•</span>
											<span>{dungeonItem.max_floors} Floors</span>
										</div>

										<Button
											onclick={() => handleEnterDungeon(dungeonItem.id)}
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
						<!-- Dungeon Header -->
						<DungeonHeader
							dungeonName={dungeon.dungeonName}
							currentFloor={dungeon.currentFloor}
							maxFloor={dungeon.maxFloors}
							monstersDefeated={dungeon.monstersDefeated}
							monstersTotal={3}
							recommendedLevel={character.level}
						/>

						<!-- Status Area -->
						<Card>
							<h3 class="text-xl font-serif text-arcana-gold-400 mb-4">Current Status</h3>
							<p class="text-arcana-text-secondary leading-relaxed mb-4">
								You stand in a dimly lit chamber. The walls are covered with ancient runes that pulse with a faint, eerie glow.
								Multiple passages lead deeper into the darkness. You can hear the distant echoes of something lurking below.
							</p>
						</Card>

						<!-- Action Buttons -->
						<div class="grid grid-cols-2 gap-4">
							<Button
								variant="primary"
								class="w-full flex items-center justify-center gap-2"
								onclick={handleFight}
							>
								<Sword size={20} />
								Fight Monster
							</Button>
							<Button
								variant="secondary"
								class="w-full flex items-center justify-center gap-2"
								onclick={handleExplore}
							>
								<Search size={20} />
								Explore
							</Button>
							<Button
								variant="secondary"
								class="w-full flex items-center justify-center gap-2"
								onclick={handleDescend}
							>
								<ArrowDown size={20} />
								Descend
							</Button>
							<Button
								variant="secondary"
								class="w-full flex items-center justify-center gap-2"
								onclick={handleExitDungeon}
							>
								<LogOut size={20} />
								Exit Dungeon
							</Button>
						</div>

						<!-- Adventure Log -->
						<Card>
							<AdventureLog messages={adventureMessages} />
						</Card>

						<!-- Combat Arena (only shown during combat) -->
						{#if combat.isInCombat}
							<CombatArena
								characterId={character.id || 0}
								characterName={character.name}
								characterHP={character.hp}
								characterMaxHP={character.maxHp}
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>
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
</style>
