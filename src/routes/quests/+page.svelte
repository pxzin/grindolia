<script lang="ts">
	/**
	 * Quest Board Page
	 * View and accept available quests
	 */
	import { goto } from '$app/navigation';
	import { characterStore } from '$lib/stores/character.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import {
		Scroll,
		ArrowLeft,
		CheckCircle,
		Clock,
		Star,
		Coins,
		Plus,
		Target,
		Skull,
		Package,
		Compass,
		MessageCircle
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { QuestTemplate, CharacterQuest, QuestObjective } from '$lib/types/quest';
	import { calculateQuestProgress } from '$lib/types/quest';

	// Get server-side data
	let { data } = $props<{ data: { characterId: number; userId: number } }>();

	const character = $derived(characterStore.character);

	interface DisplayObjective {
		type: string;
		description: string;
		current: number;
		required: number;
		completed: boolean;
	}

	interface DisplayQuest {
		id: number;
		templateId: number;
		title: string;
		description: string;
		type: 'available' | 'active';
		difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
		rewards: {
			xp: number;
			gold: number;
		};
		progress: number;
		target: number;
		completed: boolean;
		minLevel: number;
		objectives: DisplayObjective[];
	}

	let availableQuests = $state<QuestTemplate[]>([]);
	let activeQuests = $state<CharacterQuest[]>([]);
	let displayQuests = $state<DisplayQuest[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let acceptingQuest = $state<number | null>(null);

	onMount(async () => {
		// Load character from session if not in store
		if (!characterStore.isLoaded && data.characterId) {
			await characterStore.loadCharacter(data.characterId);
		}
		await loadQuests();
	});

	async function loadQuests() {
		if (!character && !data.characterId) {
			error = 'No character selected';
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;

			const characterId = character?.id || data.characterId;
			const response = await fetch(`/api/quest?characterId=${characterId}`);

			if (!response.ok) {
				throw new Error('Failed to load quests');
			}

			const data = await response.json();
			availableQuests = data.availableQuests || [];
			activeQuests = data.activeQuests || [];

			// Transform to display format
			const active: DisplayQuest[] = activeQuests.map((q) => {
				const objectives = (q.template?.objectives || []) as QuestObjective[];
				const progressData = q.progress || {};

				return {
					id: q.id,
					templateId: q.quest_template_id,
					title: q.template?.title || 'Unknown Quest',
					description: q.template?.description || '',
					type: 'active' as const,
					difficulty: getDifficultyFromLevel(q.template?.min_level || 1),
					rewards: {
						xp: q.template?.rewards?.xp || 0,
						gold: q.template?.rewards?.currency || 0
					},
					progress: objectives.length > 0 ? calculateQuestProgress(objectives, progressData) : 0,
					target: 100,
					completed: q.status === 'completed',
					minLevel: q.template?.min_level || 1,
					objectives: objectives.map((obj) => {
						const key = `${obj.type}_${obj.target}`;
						const current = progressData[key] || 0;
						return {
							type: obj.type,
							description: obj.description || formatObjectiveText(obj),
							current,
							required: obj.count,
							completed: current >= obj.count
						};
					})
				};
			});

			const available: DisplayQuest[] = availableQuests.map((q) => {
				const objectives = (q.objectives || []) as QuestObjective[];

				return {
					id: 0,
					templateId: q.id,
					title: q.title,
					description: q.description,
					type: 'available' as const,
					difficulty: getDifficultyFromLevel(q.min_level),
					rewards: {
						xp: q.rewards?.xp || 0,
						gold: q.rewards?.currency || 0
					},
					progress: 0,
					target: 100,
					completed: false,
					minLevel: q.min_level,
					objectives: objectives.map((obj) => ({
						type: obj.type,
						description: obj.description || formatObjectiveText(obj),
						current: 0,
						required: obj.count,
						completed: false
					}))
				};
			});

			displayQuests = [...active, ...available];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load quests';
			console.error('Error loading quests:', err);
		} finally {
			loading = false;
		}
	}

	async function acceptQuest(templateId: number) {
		if (!character) return;

		try {
			acceptingQuest = templateId;

			const response = await fetch('/api/quest/accept', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					characterId: character.id,
					questTemplateId: templateId
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to accept quest');
			}

			// Reload quests to reflect changes
			await loadQuests();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to accept quest';
		} finally {
			acceptingQuest = null;
		}
	}

	function getDifficultyFromLevel(minLevel: number): DisplayQuest['difficulty'] {
		if (minLevel <= 3) return 'easy';
		if (minLevel <= 7) return 'medium';
		if (minLevel <= 12) return 'hard';
		return 'legendary';
	}

	function formatObjectiveText(obj: QuestObjective): string {
		const actionText: Record<string, string> = {
			kill: 'Defeat',
			collect: 'Collect',
			interact: 'Interact with',
			explore: 'Explore',
			talk: 'Talk to'
		};
		return `${actionText[obj.type] || obj.type} ${obj.target} (${obj.count})`;
	}

	function getObjectiveIcon(type: string) {
		switch (type) {
			case 'kill':
				return Skull;
			case 'collect':
				return Package;
			case 'explore':
				return Compass;
			case 'talk':
				return MessageCircle;
			default:
				return Target;
		}
	}

	function goBack() {
		goto('/town');
	}

	function getDifficultyColor(difficulty: DisplayQuest['difficulty']): string {
		switch (difficulty) {
			case 'easy':
				return 'text-arcana-green-400';
			case 'medium':
				return 'text-arcana-cyan-400';
			case 'hard':
				return 'text-arcana-orange-400';
			case 'legendary':
				return 'text-arcana-gold-400';
		}
	}

	function getTypeColor(type: DisplayQuest['type']): string {
		switch (type) {
			case 'active':
				return 'bg-arcana-gold-600/20 text-arcana-gold-400';
			case 'available':
				return 'bg-arcana-cyan-600/20 text-arcana-cyan-400';
		}
	}

	function getTypeLabel(type: DisplayQuest['type']): string {
		switch (type) {
			case 'active':
				return 'Active';
			case 'available':
				return 'Available';
		}
	}
</script>

<svelte:head>
	<title>Quest Board - Grindolia</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-4 md:p-8"
>
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="flex items-center gap-4 mb-8">
			<Button variant="secondary" onclick={goBack} class="flex items-center gap-2">
				<ArrowLeft size={18} />
				Back
			</Button>
			<div class="flex-1 text-center">
				<h1
					class="text-4xl font-serif text-arcana-gold-400 drop-shadow-[0_0_20px_rgba(201,154,74,0.4)]"
				>
					Quest Board
				</h1>
				{#if character}
					<p class="text-sm text-arcana-text-muted mt-1">
						{character.name} - Level {character.level}
					</p>
				{/if}
			</div>
			<div class="w-20"></div>
		</div>

		{#if loading}
			<!-- Loading State -->
			<div class="space-y-4">
				{#each Array(3) as _}
					<Card variant="elevated">
						<div class="p-6">
							<div class="flex items-start gap-4">
								<Skeleton variant="circular" width="48px" height="48px" />
								<div class="flex-1">
									<Skeleton variant="text" width="200px" />
									<Skeleton variant="text" width="100%" />
									<Skeleton variant="rectangular" width="100%" height="20px" />
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{:else if error}
			<!-- Error State -->
			<Card variant="elevated">
				<div class="p-8 text-center">
					<p class="text-arcana-orange-400 mb-4">{error}</p>
					<Button variant="primary" onclick={() => window.location.reload()}>Try Again</Button>
				</div>
			</Card>
		{:else}
			<!-- Quest List -->
			<div class="space-y-4">
				{#each displayQuests as quest}
					<Card variant={quest.completed ? 'default' : 'elevated'}>
						<div class="p-6 {quest.completed ? 'opacity-60' : ''}">
							<div class="flex items-start gap-4">
								<!-- Quest Icon -->
								<div
									class="w-12 h-12 rounded-full flex items-center justify-center bg-arcana-bg-primary"
								>
									{#if quest.completed}
										<CheckCircle size={24} class="text-arcana-green-400" />
									{:else if quest.type === 'available'}
										<Plus size={24} class="text-arcana-cyan-400" />
									{:else}
										<Scroll size={24} class="text-arcana-gold-400" />
									{/if}
								</div>

								<div class="flex-1">
									<!-- Quest Header -->
									<div class="flex items-center gap-2 mb-2">
										<h3 class="text-lg font-serif text-arcana-text-primary">
											{quest.title}
										</h3>
										<span class="text-xs px-2 py-1 rounded-full {getTypeColor(quest.type)}">
											{getTypeLabel(quest.type)}
										</span>
										<span class="text-xs text-arcana-text-muted">
											Lv. {quest.minLevel}+
										</span>
									</div>

									<!-- Description -->
									<p class="text-sm text-arcana-text-secondary mb-3">
										{quest.description}
									</p>

									<!-- Objectives List -->
									{#if quest.objectives.length > 0}
										<div class="mb-3 bg-arcana-bg-primary/50 rounded-lg p-3">
											<div class="text-xs text-arcana-text-muted mb-2 font-semibold">
												Objectives:
											</div>
											<div class="space-y-2">
												{#each quest.objectives as objective}
													<div class="flex items-center gap-2">
														<svelte:component
															this={getObjectiveIcon(objective.type)}
															size={14}
															class={objective.completed
																? 'text-arcana-green-400'
																: 'text-arcana-text-muted'}
														/>
														<span
															class="text-xs flex-1 {objective.completed
																? 'text-arcana-green-400 line-through'
																: 'text-arcana-text-secondary'}"
														>
															{objective.description}
														</span>
														{#if quest.type === 'active'}
															<span
																class="text-xs font-mono {objective.completed
																	? 'text-arcana-green-400'
																	: 'text-arcana-text-muted'}"
															>
																{objective.current}/{objective.required}
															</span>
														{:else}
															<span class="text-xs font-mono text-arcana-text-muted">
																0/{objective.required}
															</span>
														{/if}
													</div>
												{/each}
											</div>
										</div>
									{/if}

									<!-- Progress Bar (only for active quests) -->
									{#if quest.type === 'active' && !quest.completed}
										<div class="mb-3">
											<div class="flex justify-between text-xs text-arcana-text-muted mb-1">
												<span>Overall Progress</span>
												<span>{quest.progress}%</span>
											</div>
											<div class="w-full bg-black/30 rounded-full h-2">
												<div
													class="bg-gradient-to-r from-arcana-gold-600 to-arcana-gold-400 h-2 rounded-full transition-all"
													style="width: {quest.progress}%"
												></div>
											</div>
										</div>
									{/if}

									<!-- Rewards & Difficulty -->
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-4 text-sm">
											<span class="flex items-center gap-1 text-arcana-cyan-400">
												<Star size={14} />
												{quest.rewards.xp} XP
											</span>
											<span class="flex items-center gap-1 text-arcana-gold-400">
												<Coins size={14} />
												{quest.rewards.gold} Gold
											</span>
										</div>
										<span class="text-xs {getDifficultyColor(quest.difficulty)} font-semibold">
											{quest.difficulty.toUpperCase()}
										</span>
									</div>

									<!-- Accept Button (for available quests) -->
									{#if quest.type === 'available'}
										<div class="mt-3">
											<Button
												variant="primary"
												onclick={() => acceptQuest(quest.templateId)}
												disabled={acceptingQuest === quest.templateId}
												class="w-full"
											>
												{#if acceptingQuest === quest.templateId}
													Accepting...
												{:else}
													Accept Quest
												{/if}
											</Button>
										</div>
									{/if}

									<!-- Completed Badge -->
									{#if quest.completed}
										<div
											class="mt-3 text-xs text-arcana-green-400 flex items-center gap-1 justify-end"
										>
											<CheckCircle size={12} />
											COMPLETED
										</div>
									{/if}
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Empty State -->
			{#if displayQuests.length === 0}
				<Card variant="elevated">
					<div class="p-12 text-center">
						<Scroll size={48} class="text-arcana-text-muted mx-auto mb-4" />
						<h2 class="text-2xl font-serif text-arcana-text-primary mb-2">No Quests Available</h2>
						<p class="text-arcana-text-secondary">Check back later for new adventures</p>
					</div>
				</Card>
			{/if}
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
</style>
