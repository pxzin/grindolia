<script lang="ts">
	import { onMount } from 'svelte';
	import QuestList from '$lib/components/quest/QuestList.svelte';
	import QuestDetails from '$lib/components/quest/QuestDetails.svelte';
	import { questStore } from '$lib/stores/quest.svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import type { QuestTemplate } from '$lib/stores/quest.svelte';

	let { data } = $props();

	// Load quest data into store on mount
	onMount(() => {
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
		if (!character.id) {
			throw new Error('No character selected');
		}

		const response = await fetch('/api/quest/accept', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				characterId: character.id,
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
</script>

<div class="quest-page">
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
	}
</style>
