<script lang="ts">
	/**
	 * Debug Panel Component
	 * Developer tools for debugging game state and actions
	 */
	import { characterStore } from '$lib/stores/character.svelte';
	import { leaderboardStore } from '$lib/stores/leaderboard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Bug, X, RefreshCw, Zap } from 'lucide-svelte';

	interface Character {
		id: number;
		name: string;
		class: string;
		level: number;
		hp: number;
		maxHp: number;
	}

	let isOpen = $state(false);
	let selectedTab = $state<'character' | 'characters' | 'leaderboard' | 'actions'>('character');
	let allCharacters = $state<Character[]>([]);
	let loadingCharacters = $state(false);

	const character = $derived(characterStore.character);
	const leaderboard = $derived({
		entries: leaderboardStore.entries,
		category: leaderboardStore.category,
		rank: leaderboardStore.playerRank
	});

	async function loadAllCharacters() {
		if (allCharacters.length > 0) return; // Already loaded

		try {
			loadingCharacters = true;
			const response = await fetch('/api/characters');
			if (response.ok) {
				const data = await response.json();
				allCharacters = data.characters || [];
			}
		} catch (err) {
			console.error('Failed to load characters:', err);
		} finally {
			loadingCharacters = false;
		}
	}

	function togglePanel() {
		isOpen = !isOpen;
	}

	function addGold(amount: number) {
		if (character) {
			characterStore.updateCurrency(character.currency + amount);
		}
	}

	function addXP(amount: number) {
		if (character) {
			characterStore.updateExperience(character.xp + amount);
		}
	}

	function healFull() {
		if (character) {
			characterStore.updateHealth(character.maxHp);
		}
	}

	function levelUp() {
		if (character) {
			// Simplified level up - just add XP to next level
			characterStore.updateExperience(character.xp + 1000);
		}
	}
</script>

{#if import.meta.env.DEV}
	<!-- Toggle Button -->
	<button
		onclick={togglePanel}
		class="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-arcana-orange-600 hover:bg-arcana-orange-500 text-white shadow-lg flex items-center justify-center transition-all"
		aria-label="Toggle Debug Panel"
	>
		{#if isOpen}
			<X size={20} />
		{:else}
			<Bug size={20} />
		{/if}
	</button>

	<!-- Debug Panel -->
	{#if isOpen}
		<div class="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] overflow-hidden">
			<Card variant="elevated" class="shadow-2xl">
				<div class="p-4">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-serif text-arcana-gold-400 flex items-center gap-2">
							<Bug size={20} />
							Debug Panel
						</h3>
						<span class="text-xs text-arcana-text-muted">DEV MODE</span>
					</div>

					<!-- Tabs -->
					<div class="flex gap-2 mb-4 flex-wrap">
						<button
							onclick={() => (selectedTab = 'character')}
							class="px-3 py-1 rounded text-sm {selectedTab === 'character'
								? 'bg-arcana-gold-600 text-arcana-bg-primary'
								: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
						>
							Current
						</button>
						<button
							onclick={() => {
								selectedTab = 'characters';
								loadAllCharacters();
							}}
							class="px-3 py-1 rounded text-sm {selectedTab === 'characters'
								? 'bg-arcana-gold-600 text-arcana-bg-primary'
								: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
						>
							All Chars
						</button>
						<button
							onclick={() => (selectedTab = 'leaderboard')}
							class="px-3 py-1 rounded text-sm {selectedTab === 'leaderboard'
								? 'bg-arcana-gold-600 text-arcana-bg-primary'
								: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
						>
							Board
						</button>
						<button
							onclick={() => (selectedTab = 'actions')}
							class="px-3 py-1 rounded text-sm {selectedTab === 'actions'
								? 'bg-arcana-gold-600 text-arcana-bg-primary'
								: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
						>
							Actions
						</button>
					</div>

					<!-- Content -->
					<div class="max-h-[400px] overflow-y-auto">
						{#if selectedTab === 'character'}
							<div class="space-y-3">
								{#if character}
									<div class="text-xs space-y-2">
										<div class="grid grid-cols-2 gap-2">
											<div>
												<span class="text-arcana-text-muted">ID:</span>
												<span class="text-arcana-text-primary ml-1">{character.id}</span>
											</div>
											<div>
												<span class="text-arcana-text-muted">Level:</span>
												<span class="text-arcana-text-primary ml-1">{character.level}</span>
											</div>
											<div>
												<span class="text-arcana-text-muted">HP:</span>
												<span class="text-arcana-text-primary ml-1"
													>{character.hp}/{character.maxHp}</span
												>
											</div>
											<div>
												<span class="text-arcana-text-muted">XP:</span>
												<span class="text-arcana-text-primary ml-1">{character.xp}</span>
											</div>
											<div>
												<span class="text-arcana-text-muted">Gold:</span>
												<span class="text-arcana-text-primary ml-1">{character.currency}</span>
											</div>
											<div>
												<span class="text-arcana-text-muted">Status:</span>
												<span class="text-arcana-text-primary ml-1">{character.status}</span>
											</div>
										</div>
										<div>
											<span class="text-arcana-text-muted">Stats:</span>
											<pre
												class="text-xs bg-arcana-bg-primary p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(character.stats, null, 2)}</pre>
										</div>
									</div>
								{:else}
									<p class="text-sm text-arcana-text-muted">No character loaded</p>
								{/if}
							</div>
						{:else if selectedTab === 'characters'}
							<div class="space-y-3">
								{#if loadingCharacters}
									<p class="text-sm text-arcana-text-muted">Loading characters...</p>
								{:else if allCharacters.length > 0}
									{#each allCharacters as char}
										<div class="bg-arcana-bg-primary p-3 rounded border border-arcana-border-default">
											<div class="flex justify-between items-start mb-2">
												<div>
													<div class="font-semibold text-arcana-text-primary">{char.name}</div>
													<div class="text-xs text-arcana-text-muted">
														Lvl {char.level} {char.class}
													</div>
												</div>
												<div class="text-xs text-arcana-text-muted">
													ID: {char.id}
												</div>
											</div>
											<!-- HP Bar -->
											<div class="w-full">
												<div class="flex justify-between text-xs text-arcana-text-muted mb-1">
													<span>HP</span>
													<span>{char.hp}/{char.maxHp}</span>
												</div>
												<div class="w-full bg-black/30 rounded-full h-1.5">
													<div
														class="bg-gradient-to-r from-arcana-orange-600 to-arcana-orange-500 h-1.5 rounded-full"
														style="width: {(char.hp / char.maxHp) * 100}%"
													></div>
												</div>
											</div>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-arcana-text-muted">No characters found</p>
								{/if}
							</div>
						{:else if selectedTab === 'leaderboard'}
							<div class="space-y-3">
								<div class="text-xs space-y-2">
									<div>
										<span class="text-arcana-text-muted">Category:</span>
										<span class="text-arcana-text-primary ml-1">{leaderboard.category}</span>
									</div>
									<div>
										<span class="text-arcana-text-muted">Your Rank:</span>
										<span class="text-arcana-text-primary ml-1"
											>{leaderboard.rank ?? 'Not ranked'}</span
										>
									</div>
									<div>
										<span class="text-arcana-text-muted">Entries:</span>
										<span class="text-arcana-text-primary ml-1">{leaderboard.entries.length}</span
										>
									</div>
								</div>
							</div>
						{:else if selectedTab === 'actions'}
							<div class="space-y-2">
								<Button
									variant="secondary"
									size="sm"
									onclick={() => addGold(1000)}
									class="w-full flex items-center justify-center gap-2"
								>
									<Zap size={14} />
									+1000 Gold
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onclick={() => addXP(500)}
									class="w-full flex items-center justify-center gap-2"
								>
									<Zap size={14} />
									+500 XP
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onclick={healFull}
									class="w-full flex items-center justify-center gap-2"
								>
									<RefreshCw size={14} />
									Heal Full
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onclick={levelUp}
									class="w-full flex items-center justify-center gap-2"
								>
									<Zap size={14} />
									Level Up
								</Button>
							</div>
						{/if}
					</div>
				</div>
			</Card>
		</div>
	{/if}
{/if}
