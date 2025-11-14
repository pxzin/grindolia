<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { QuestTemplate, ActiveQuest } from '$lib/stores/quest.svelte';

	interface Props {
		availableQuests: QuestTemplate[];
		activeQuests: ActiveQuest[];
		onAcceptQuest: (questId: number) => Promise<void>;
		onSelectQuest: (quest: QuestTemplate) => void;
	}

	let { availableQuests, activeQuests, onAcceptQuest, onSelectQuest }: Props = $props();

	let accepting = $state<number | null>(null);

	const handleAcceptQuest = async (questId: number) => {
		try {
			accepting = questId;
			await onAcceptQuest(questId);
		} catch (error) {
			console.error('Failed to accept quest:', error);
		} finally {
			accepting = null;
		}
	};

	const isQuestActive = (questId: number): boolean => {
		return activeQuests.some((q) => q.questTemplateId === questId && q.status === 'in_progress');
	};

	const getQuestProgress = (questId: number): number => {
		const activeQuest = activeQuests.find((q) => q.questTemplateId === questId);
		if (!activeQuest) return 0;

		const totalRequired = activeQuest.progress.reduce((sum, obj) => sum + obj.required, 0);
		const totalCurrent = activeQuest.progress.reduce(
			(sum, obj) => sum + Math.min(obj.current, obj.required),
			0
		);

		return totalRequired > 0 ? totalCurrent / totalRequired : 0;
	};
</script>

<div class="quest-list">
	<h2 class="text-2xl font-bold mb-6">Available Quests</h2>

	{#if availableQuests.length === 0}
		<Card variant="glass" class="p-8 text-center">
			<p class="text-gray-11">No quests available at your level</p>
		</Card>
	{:else}
		<div class="quest-grid">
			{#each availableQuests as quest}
				{@const active = isQuestActive(quest.id)}
				{@const progress = getQuestProgress(quest.id)}

				<Card variant="glass" class="quest-card">
					<div class="quest-header">
						<h3 class="quest-title">{quest.title}</h3>
						<span class="quest-level">Level {quest.minLevel}</span>
					</div>

					<p class="quest-description">{quest.description}</p>

					<div class="quest-objectives">
						<h4 class="text-sm font-medium mb-2">Objectives:</h4>
						<ul class="objective-list">
							{#each quest.objectives as objective}
								<li>{objective.description}</li>
							{/each}
						</ul>
					</div>

					<div class="quest-rewards">
						<h4 class="text-sm font-medium mb-2">Rewards:</h4>
						<div class="rewards-grid">
							{#if quest.rewards.xp}
								<span class="reward">+{quest.rewards.xp} XP</span>
							{/if}
							{#if quest.rewards.currency}
								<span class="reward">+{quest.rewards.currency} Gold</span>
							{/if}
						</div>
					</div>

					{#if active}
						<div class="quest-progress-section">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {progress * 100}%"></div>
							</div>
							<span class="progress-text">{Math.round(progress * 100)}% Complete</span>
						</div>
					{/if}

					<div class="quest-actions">
						{#if active}
							<Button
								variant="secondary"
								size="sm"
								onclick={() => onSelectQuest(quest)}
								class="w-full"
							>
								View Progress
							</Button>
						{:else}
							<Button
								variant="primary"
								size="sm"
								onclick={() => handleAcceptQuest(quest.id)}
								disabled={accepting === quest.id}
								class="w-full"
							>
								{accepting === quest.id ? 'Accepting...' : 'Accept Quest'}
							</Button>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.quest-list {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.quest-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.quest-card {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.quest-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	.quest-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-primary-12);
		flex: 1;
	}

	.quest-level {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary-11);
		background: var(--color-primary-4);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		white-space: nowrap;
	}

	.quest-description {
		font-size: 0.875rem;
		color: var(--color-gray-11);
		line-height: 1.5;
	}

	.quest-objectives {
		border-top: 1px solid var(--color-gray-6);
		padding-top: 1rem;
	}

	.objective-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.objective-list li {
		font-size: 0.875rem;
		color: var(--color-gray-11);
		padding: 0.25rem 0;
		padding-left: 1.25rem;
		position: relative;
	}

	.objective-list li::before {
		content: '•';
		position: absolute;
		left: 0.5rem;
		color: var(--color-primary-9);
	}

	.quest-rewards {
		border-top: 1px solid var(--color-gray-6);
		padding-top: 1rem;
	}

	.rewards-grid {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.reward {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-yellow-11);
		background: var(--color-yellow-3);
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
	}

	.quest-progress-section {
		border-top: 1px solid var(--color-gray-6);
		padding-top: 1rem;
	}

	.progress-bar {
		width: 100%;
		height: 0.5rem;
		background: var(--color-gray-4);
		border-radius: 9999px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(to right, var(--color-primary-9), var(--color-primary-10));
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.75rem;
		color: var(--color-gray-11);
		text-align: center;
		display: block;
	}

	.quest-actions {
		margin-top: auto;
	}
</style>
