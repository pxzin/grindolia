<script lang="ts">
	/**
	 * Character Selection Page
	 * Select existing character or create new one
	 */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { Plus, User } from 'lucide-svelte';
	import { characterStore } from '$lib/stores/character.svelte';

	interface Character {
		id: number;
		name: string;
		class: string;
		level: number;
		hp: number;
		maxHp: number;
	}

	let characters = $state<Character[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadCharacters();
	});

	async function loadCharacters() {
		try {
			loading = true;
			const response = await fetch('/api/characters');

			if (!response.ok) {
				throw new Error('Failed to load characters');
			}

			const data = await response.json();
			characters = data.characters || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load characters';
			console.error('Error loading characters:', err);
		} finally {
			loading = false;
		}
	}

	async function selectCharacter(characterId: number) {
		try {
			// Persist character selection in session
			const response = await fetch('/api/character/select', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ characterId })
			});

			if (!response.ok) {
				throw new Error('Failed to select character');
			}

			// Load character data into store
			await characterStore.loadCharacter(characterId);
			// Redirect to town hall
			goto('/town');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to select character';
			console.error('Error selecting character:', err);
		}
	}

	function createNewCharacter() {
		goto('/character/create');
	}
</script>

<svelte:head>
	<title>Select Character - Grindolia</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-4 md:p-8"
>
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-5xl font-serif text-arcana-gold-400 mb-4 drop-shadow-[0_0_20px_rgba(201,152,74,0.4)]">
				Select Your Hero
			</h1>
			<p class="text-xl text-arcana-text-secondary">Choose a character to continue your adventure</p>
		</div>

		{#if loading}
			<!-- Loading State -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{#each Array(2) as _}
					<Card variant="elevated">
						<div class="p-6">
							<div class="flex items-center gap-4 mb-4">
								<Skeleton variant="circular" width="64px" height="64px" />
								<div class="flex-1">
									<Skeleton variant="text" width="150px" />
									<Skeleton variant="text" width="100px" />
								</div>
							</div>
							<Skeleton variant="rectangular" width="100%" height="40px" />
						</div>
					</Card>
				{/each}
			</div>
		{:else if error}
			<!-- Error State -->
			<Card variant="elevated" class="mb-8">
				<div class="p-8 text-center">
					<p class="text-arcana-orange-600 mb-4">{error}</p>
					<Button variant="primary" onclick={loadCharacters}>Try Again</Button>
				</div>
			</Card>
		{:else if characters.length > 0}
			<!-- Characters List -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				{#each characters as character}
					<button
						onclick={() => selectCharacter(character.id)}
						class="text-left w-full"
					>
						<Card variant="elevated" class="hover:scale-105 transition-all cursor-pointer">
							<div class="p-6">
								<div class="flex items-center gap-4 mb-4">
									<div
										class="w-16 h-16 rounded-full bg-arcana-gold-600/20 flex items-center justify-center"
									>
										<User size={32} class="text-arcana-gold-400" />
									</div>
									<div class="flex-1">
										<h3 class="text-xl font-serif text-arcana-text-primary">{character.name}</h3>
										<p class="text-sm text-arcana-text-muted mb-2">
											Level {character.level} {character.class}
										</p>
										<!-- HP Bar -->
										<div class="w-full">
											<div class="flex justify-between text-xs text-arcana-text-muted mb-1">
												<span>HP</span>
												<span>{character.hp} / {character.maxHp}</span>
											</div>
											<div class="w-full bg-black/30 rounded-full h-2">
												<div
													class="bg-gradient-to-r from-arcana-orange-600 to-arcana-orange-500 h-2 rounded-full transition-all"
													style="width: {(character.hp / character.maxHp) * 100}%"
												></div>
											</div>
										</div>
									</div>
								</div>
								<Button variant="secondary" class="w-full">
									Continue Adventure
								</Button>
							</div>
						</Card>
					</button>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<Card variant="elevated" class="mb-8">
				<div class="p-12 text-center">
					<div
						class="w-20 h-20 mx-auto mb-6 rounded-full bg-arcana-bg-elevated flex items-center justify-center"
					>
						<User size={40} class="text-arcana-text-muted" />
					</div>
					<h2 class="text-2xl font-serif text-arcana-text-primary mb-2">No Characters Yet</h2>
					<p class="text-arcana-text-secondary mb-6">
						Create your first character to begin your epic adventure
					</p>
				</div>
			</Card>
		{/if}

		<!-- Create New Character Button -->
		<Card variant="gold">
			<button
				onclick={createNewCharacter}
				class="w-full p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-all"
			>
				<div
					class="w-20 h-20 rounded-full bg-arcana-gold-600/20 flex items-center justify-center"
				>
					<Plus size={40} class="text-arcana-gold-400" />
				</div>
				<div class="text-center">
					<h3 class="text-2xl font-serif text-arcana-gold-400 mb-2">Create New Character</h3>
					<p class="text-arcana-text-secondary">Begin a new adventure with a fresh hero</p>
				</div>
			</button>
		</Card>
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
