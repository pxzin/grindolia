<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { QuestTemplate, ActiveQuest } from '$lib/stores/quest.svelte';
	import type { QuestObjective } from '$lib/types/quest';

	interface Props {
		quest: QuestTemplate | null;
		activeQuest: ActiveQuest | null;
		onClose: () => void;
		onComplete?: (questId: number) => Promise<void>;
	}

	let { quest, activeQuest, onClose, onComplete }: Props = $props();

	let completing = $state(false);

	const handleComplete = async () => {
		if (!activeQuest || !onComplete) return;

		try {
			completing = true;
			await onComplete(activeQuest.id);
			onClose();
		} catch (error) {
			console.error('Failed to complete quest:', error);
		} finally {
			completing = false;
		}
	};

	const isObjectiveComplete = (objective: QuestObjective): boolean => {
		return objective.current >= objective.required;
	};

	const areAllObjectivesComplete = $derived(() => {
		if (!activeQuest) return false;
		return activeQuest.progress.every(isObjectiveComplete);
	});
</script>

{#if quest}
	<div class="quest-details-overlay" onclick={onClose} role="presentation">
		<Card
			variant="glass"
			class="quest-details-modal"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<!-- Header -->
			<div class="modal-header">
				<h2 class="modal-title">{quest.title}</h2>
				<button class="close-button" onclick={onClose} aria-label="Close">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="modal-content">
				<!-- Description -->
				<div class="section">
					<p class="quest-description">{quest.description}</p>
				</div>

				<!-- Level Requirement -->
				<div class="section">
					<div class="info-row">
						<span class="info-label">Level Requirement:</span>
						<span class="info-value">{quest.minLevel}</span>
					</div>
					{#if quest.isRepeatable}
						<div class="info-row">
							<span class="info-label">Repeatable:</span>
							<span class="info-value">
								Yes
								{#if quest.cooldownHours}
									({quest.cooldownHours}h cooldown)
								{/if}
							</span>
						</div>
					{/if}
				</div>

				<!-- Objectives -->
				<div class="section">
					<h3 class="section-title">Objectives</h3>
					<ul class="objectives-list">
						{#each quest.objectives as objective, index}
							{@const activeObjective = activeQuest?.progress[index]}
							{@const complete = activeObjective ? isObjectiveComplete(activeObjective) : false}

							<li class="objective-item" class:complete>
								<div class="objective-checkbox" class:checked={complete}>
									{#if complete}
										<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
											<path d="M13.5 3.5L6 11l-3.5-3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									{/if}
								</div>
								<div class="objective-text">
									<span>{objective.description}</span>
									{#if activeObjective}
										<span class="objective-progress">
											({activeObjective.current}/{activeObjective.required})
										</span>
									{:else}
										<span class="objective-progress">(0/{objective.required})</span>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Rewards -->
				<div class="section">
					<h3 class="section-title">Rewards</h3>
					<div class="rewards-list">
						{#if quest.rewards.xp}
							<div class="reward-item">
								<span class="reward-icon">⭐</span>
								<span class="reward-text">{quest.rewards.xp} XP</span>
							</div>
						{/if}
						{#if quest.rewards.currency}
							<div class="reward-item">
								<span class="reward-icon">💰</span>
								<span class="reward-text">{quest.rewards.currency} Gold</span>
							</div>
						{/if}
						{#if quest.rewards.items && quest.rewards.items.length > 0}
							{#each quest.rewards.items as item}
								<div class="reward-item">
									<span class="reward-icon">🎁</span>
									<span class="reward-text">
										{item.quantity}x Item #{item.itemId}
									</span>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				{#if activeQuest}
					<Button
						variant="primary"
						onclick={handleComplete}
						disabled={!areAllObjectivesComplete() || completing}
						class="w-full"
					>
						{completing ? 'Completing...' : 'Complete Quest'}
					</Button>
				{:else}
					<Button variant="secondary" onclick={onClose} class="w-full">Close</Button>
				{/if}
			</div>
		</Card>
	</div>
{/if}

<style>
	.quest-details-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 1rem;
	}

	.quest-details-modal {
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-gray-6);
	}

	.modal-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary-12);
	}

	.close-button {
		background: none;
		border: none;
		color: var(--color-gray-11);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: var(--color-gray-4);
		color: var(--color-gray-12);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.section {
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-primary-11);
		margin-bottom: 0.75rem;
	}

	.quest-description {
		font-size: 1rem;
		color: var(--color-gray-11);
		line-height: 1.6;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		font-size: 0.875rem;
	}

	.info-label {
		color: var(--color-gray-11);
	}

	.info-value {
		color: var(--color-primary-11);
		font-weight: 500;
	}

	.objectives-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.objective-item {
		display: flex;
		align-items: start;
		gap: 0.75rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 0.375rem;
		background: var(--color-gray-2);
		transition: all 0.2s ease;
	}

	.objective-item.complete {
		background: var(--color-green-3);
	}

	.objective-checkbox {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--color-gray-7);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.objective-checkbox.checked {
		background: var(--color-green-9);
		border-color: var(--color-green-9);
		color: white;
	}

	.objective-text {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-gray-12);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.objective-progress {
		color: var(--color-gray-10);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.rewards-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.reward-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--color-yellow-3);
		border-radius: 0.375rem;
	}

	.reward-icon {
		font-size: 1.5rem;
	}

	.reward-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-yellow-11);
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--color-gray-6);
	}
</style>
