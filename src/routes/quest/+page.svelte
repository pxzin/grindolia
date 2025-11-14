<script lang="ts">
	import { onMount } from 'svelte';
	import QuestList from '$lib/components/quest/QuestList.svelte';
	import QuestDetails from '$lib/components/quest/QuestDetails.svelte';
	import { questStore } from '$lib/stores/quest.svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import type { QuestTemplate } from '$lib/stores/quest.svelte';

	let { data } = $props();

	// Load quest data into store on mount
	onMount(async () => {
		// Load character if not already loaded
		if (data.character && !characterStore.isLoaded) {
			await characterStore.loadCharacter();
		}

		// Load quest data
		if (data.quests) {
			questStore.setAvailableQuests(data.quests.available);
			questStore.setActiveQuests(data.quests.active);
		}
	});

	const availableQuests = $derived(questStore.availableQuests);
	const activeQuests = $derived(questStore.activeQuests);
	const selectedQuest = $derived(questStore.selectedQuest);
	const character = $derived(characterStore.state);

	const handleAcceptQuest = async (questId: number) => {
		// Use character from data if store doesn't have it
		const characterId = character.id || data.character?.id;

		if (!characterId) {
			throw new Error('No character selected');
		}

		const response = await fetch('/api/quest/accept', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				characterId: characterId,
				questTemplateId: questId
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to accept quest');
		}

		const result = await response.json();

		// Add to active quests
		questStore.addActiveQuest({
			id: result.questId,
			questTemplateId: questId,
			status: 'in_progress',
			progress: [],
			startedAt: Math.floor(Date.now() / 1000)
		});

		// Reload quest data
		window.location.reload();
	};

	const handleSelectQuest = (quest: QuestTemplate) => {
		questStore.selectQuest(quest);
	};

	const handleCloseDetails = () => {
		questStore.selectQuest(null);
	};

	const handleCompleteQuest = async (questId: number) => {
		const response = await fetch('/api/quest/complete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				characterQuestId: questId
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to complete quest');
		}

		const result = await response.json();

		// Update character with rewards
		if (result.rewards) {
			if (result.rewards.xpGained) {
				const levelUpResult = characterStore.gainXp(result.rewards.xpGained);
				if (levelUpResult.leveledUp) {
					alert(`Level Up! You are now level ${levelUpResult.newLevel}!`);
				}
			}
			if (result.rewards.currencyGained) {
				characterStore.addCurrency(result.rewards.currencyGained);
			}
		}

		// Remove from active quests
		questStore.removeActiveQuest(questId);

		// Reload quest data
		window.location.reload();
	};

	// Development: Reset all quests
	const handleResetQuests = async () => {
		const characterId = character.id || data.character?.id;
		if (!characterId) return;

		if (!confirm('Reset all active quests? This will delete all quest progress.')) {
			return;
		}

		try {
			const response = await fetch(`/api/dev/reset-quests?characterId=${characterId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to reset quests');
			}

			const result = await response.json();
			alert(`Reset complete: ${result.deletedCount} quest(s) deleted`);

			// Reload page to refresh quest list
			window.location.reload();
		} catch (error) {
			console.error('Failed to reset quests:', error);
			alert('Failed to reset quests. Check console for details.');
		}
	};
</script>

<div class="quest-page">
	<!-- Development Tools -->
	{#if import.meta.env.DEV}
		<div class="dev-tools">
			<button onclick={handleResetQuests} class="reset-button">
				🧹 Reset All Quests (Dev)
			</button>
		</div>
	{/if}

	<QuestList
		{availableQuests}
		{activeQuests}
		onAcceptQuest={handleAcceptQuest}
		onSelectQuest={handleSelectQuest}
	/>

	{#if selectedQuest}
		{@const activeQuest = activeQuests.find((q) => q.questTemplateId === selectedQuest.id) || null}
		<QuestDetails
			quest={selectedQuest}
			{activeQuest}
			onClose={handleCloseDetails}
			onComplete={handleCompleteQuest}
		/>
	{/if}
</div>

<style>
	.quest-page {
		min-height: 100vh;
		background: linear-gradient(to bottom, var(--color-primary-1), var(--color-primary-2));
		padding: 1rem;
	}

	.dev-tools {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 1000;
	}

	.reset-button {
		padding: 0.75rem 1.5rem;
		background: var(--color-red-9);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.reset-button:hover {
		background: var(--color-red-10);
		transform: translateY(-2px);
		box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
	}

	.reset-button:active {
		transform: translateY(0);
	}
</style>
