<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { characterStore } from '$lib/stores/character.svelte';

	let { data } = $props();

	// Load character data into store on mount
	onMount(() => {
		if (data.character) {
			characterStore.setCharacter({
				id: data.character.id,
				name: data.character.name,
				class: data.character.class,
				level: data.character.level,
				xp: data.character.xp,
				hp: data.character.hp,
				maxHp: data.character.maxHp,
				stats: data.character.stats,
				currency: data.character.currency,
				position: data.character.position,
				zoneId: data.character.zoneId,
				status: data.character.status
			});
		}
	});

	const character = $derived(characterStore.state);
	const xpProgress = $derived(characterStore.xpProgress);
	const hpPercentage = $derived(characterStore.hpPercentage);

	const handleViewQuests = () => {
		goto('/quest');
	};
</script>

<div class="character-detail">
	<div class="container">
		<h1 class="page-title">Character Sheet</h1>

		{#if character.id}
			<div class="character-grid">
				<!-- Character Info Card -->
				<Card variant="glass" class="character-info">
					<div class="character-header">
						<div>
							<h2 class="character-name">{character.name}</h2>
							<p class="character-class">{character.class}</p>
						</div>
						<div class="character-level">
							<span class="level-label">Level</span>
							<span class="level-value">{character.level}</span>
						</div>
					</div>

					<!-- HP Bar -->
					<div class="stat-section">
						<div class="stat-label-row">
							<span>Health</span>
							<span>{character.hp} / {character.maxHp}</span>
						</div>
						<div class="stat-bar">
							<div class="stat-fill hp-fill" style="width: {hpPercentage * 100}%"></div>
						</div>
					</div>

					<!-- XP Bar -->
					<div class="stat-section">
						<div class="stat-label-row">
							<span>Experience</span>
							<span>{Math.round(xpProgress * 100)}%</span>
						</div>
						<div class="stat-bar">
							<div class="stat-fill xp-fill" style="width: {xpProgress * 100}%"></div>
						</div>
					</div>

					<!-- Currency -->
					<div class="currency-section">
						<span class="currency-icon">💰</span>
						<span class="currency-value">{character.currency} Gold</span>
					</div>
				</Card>

				<!-- Stats Card -->
				<Card variant="glass" class="stats-card">
					<h3 class="card-title">Stats</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-icon">💪</span>
							<div class="stat-info">
								<span class="stat-name">Strength</span>
								<span class="stat-value">{character.stats.strength}</span>
							</div>
						</div>
						<div class="stat-item">
							<span class="stat-icon">🧠</span>
							<div class="stat-info">
								<span class="stat-name">Intelligence</span>
								<span class="stat-value">{character.stats.intelligence}</span>
							</div>
						</div>
						<div class="stat-item">
							<span class="stat-icon">🎯</span>
							<div class="stat-info">
								<span class="stat-name">Dexterity</span>
								<span class="stat-value">{character.stats.dexterity}</span>
							</div>
						</div>
						<div class="stat-item">
							<span class="stat-icon">❤️</span>
							<div class="stat-info">
								<span class="stat-name">Vitality</span>
								<span class="stat-value">{character.stats.vitality}</span>
							</div>
						</div>
					</div>
				</Card>

				<!-- Actions Card -->
				<Card variant="glass" class="actions-card">
					<h3 class="card-title">Actions</h3>
					<div class="actions-grid">
						<Button variant="primary" onclick={handleViewQuests} class="w-full">
							View Quests
						</Button>
						<Button variant="secondary" onclick={() => goto('/inventory')} class="w-full">
							Inventory
						</Button>
						<Button variant="secondary" onclick={() => goto('/arena')} class="w-full" disabled>
							Arena (Coming Soon)
						</Button>
					</div>
				</Card>
			</div>
		{:else}
			<Card variant="glass" class="p-8 text-center">
				<p class="text-gray-11">Character not found</p>
			</Card>
		{/if}
	</div>
</div>

<style>
	.character-detail {
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(to bottom, var(--color-primary-1), var(--color-primary-2));
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 2rem;
		text-align: center;
	}

	.character-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.character-info {
		padding: 2rem;
		grid-column: span 2;
	}

	@media (max-width: 768px) {
		.character-info {
			grid-column: span 1;
		}
	}

	.character-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 2rem;
	}

	.character-name {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 0.5rem;
	}

	.character-class {
		font-size: 1.125rem;
		color: var(--color-primary-11);
	}

	.character-level {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-primary-4);
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
	}

	.level-label {
		font-size: 0.875rem;
		color: var(--color-gray-11);
	}

	.level-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
	}

	.stat-section {
		margin-bottom: 1.5rem;
	}

	.stat-label-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: var(--color-gray-11);
		margin-bottom: 0.5rem;
	}

	.stat-bar {
		width: 100%;
		height: 0.75rem;
		background: var(--color-gray-4);
		border-radius: 9999px;
		overflow: hidden;
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 9999px;
	}

	.hp-fill {
		background: linear-gradient(to right, var(--color-red-9), var(--color-red-10));
	}

	.xp-fill {
		background: linear-gradient(to right, var(--color-primary-9), var(--color-primary-10));
	}

	.currency-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--color-yellow-3);
		border-radius: 0.5rem;
	}

	.currency-icon {
		font-size: 1.5rem;
	}

	.currency-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-yellow-11);
	}

	.stats-card,
	.actions-card {
		padding: 2rem;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-primary-11);
		margin-bottom: 1.5rem;
	}

	.stats-grid {
		display: grid;
		gap: 1rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-gray-2);
		border-radius: 0.5rem;
	}

	.stat-icon {
		font-size: 1.5rem;
	}

	.stat-info {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat-name {
		font-size: 1rem;
		color: var(--color-gray-11);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-primary-12);
	}

	.actions-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
