/**
 * Quest Store
 * Manages quest state using Svelte 5 runes
 */

import type { QuestObjective, QuestRewards } from '$lib/types/quest';

export interface QuestTemplate {
	id: number;
	title: string;
	description: string;
	minLevel: number;
	maxLevel: number | null;
	objectives: Omit<QuestObjective, 'current'>[];
	rewards: QuestRewards;
	isRepeatable: boolean;
	cooldownHours: number | null;
}

export interface ActiveQuest {
	id: number;
	questTemplateId: number;
	status: 'in_progress' | 'completed' | 'failed';
	progress: QuestObjective[];
	startedAt: number;
}

class QuestStore {
	private _availableQuests = $state<QuestTemplate[]>([]);
	private _activeQuests = $state<ActiveQuest[]>([]);
	private _selectedQuest = $state<QuestTemplate | null>(null);

	/**
	 * Get available quests (readonly)
	 */
	get availableQuests(): Readonly<QuestTemplate[]> {
		return this._availableQuests;
	}

	/**
	 * Get active quests (readonly)
	 */
	get activeQuests(): Readonly<ActiveQuest[]> {
		return this._activeQuests;
	}

	/**
	 * Get selected quest (readonly)
	 */
	get selectedQuest(): Readonly<QuestTemplate> | null {
		return this._selectedQuest;
	}

	/**
	 * Get quest by ID
	 */
	getQuestById(id: number): QuestTemplate | undefined {
		return this._availableQuests.find(q => q.id === id);
	}

	/**
	 * Get active quest by template ID
	 */
	getActiveQuestByTemplateId(templateId: number): ActiveQuest | undefined {
		return this._activeQuests.find(q => q.questTemplateId === templateId);
	}

	/**
	 * Check if quest is active
	 */
	isQuestActive(templateId: number): boolean {
		return this._activeQuests.some(q => q.questTemplateId === templateId && q.status === 'in_progress');
	}

	/**
	 * Check if quest objectives are complete
	 */
	areObjectivesComplete(quest: ActiveQuest): boolean {
		return quest.progress.every(obj => obj.current >= obj.required);
	}

	/**
	 * Get quest progress percentage (0-1)
	 */
	getQuestProgress(questId: number): number {
		const quest = this._activeQuests.find(q => q.id === questId);
		if (!quest) return 0;

		const totalRequired = quest.progress.reduce((sum, obj) => sum + obj.required, 0);
		const totalCurrent = quest.progress.reduce((sum, obj) => sum + Math.min(obj.current, obj.required), 0);

		return totalRequired > 0 ? totalCurrent / totalRequired : 0;
	}

	/**
	 * Set available quests
	 */
	setAvailableQuests(quests: QuestTemplate[]): void {
		this._availableQuests = quests;
	}

	/**
	 * Set active quests
	 */
	setActiveQuests(quests: ActiveQuest[]): void {
		this._activeQuests = quests;
	}

	/**
	 * Add quest to active quests
	 */
	addActiveQuest(quest: ActiveQuest): void {
		// Check if already exists
		const existingIndex = this._activeQuests.findIndex(q => q.id === quest.id);
		if (existingIndex >= 0) {
			this._activeQuests[existingIndex] = quest;
		} else {
			this._activeQuests = [...this._activeQuests, quest];
		}
	}

	/**
	 * Update quest progress
	 */
	updateQuestProgress(questId: number, progress: QuestObjective[]): void {
		const questIndex = this._activeQuests.findIndex(q => q.id === questId);
		if (questIndex >= 0) {
			this._activeQuests[questIndex].progress = progress;
			// Force reactivity
			this._activeQuests = [...this._activeQuests];
		}
	}

	/**
	 * Update objective progress
	 */
	updateObjectiveProgress(
		questId: number,
		objectiveType: string,
		target: string,
		amount: number = 1
	): void {
		const quest = this._activeQuests.find(q => q.id === questId);
		if (!quest) return;

		const objective = quest.progress.find(obj => obj.type === objectiveType && obj.target === target);
		if (!objective) return;

		objective.current = Math.min(objective.current + amount, objective.required);

		// Force reactivity
		this._activeQuests = [...this._activeQuests];
	}

	/**
	 * Complete quest
	 */
	completeQuest(questId: number): void {
		const questIndex = this._activeQuests.findIndex(q => q.id === questId);
		if (questIndex >= 0) {
			this._activeQuests[questIndex].status = 'completed';
			// Force reactivity
			this._activeQuests = [...this._activeQuests];
		}
	}

	/**
	 * Remove quest from active quests
	 */
	removeActiveQuest(questId: number): void {
		this._activeQuests = this._activeQuests.filter(q => q.id !== questId);
	}

	/**
	 * Select a quest for details view
	 */
	selectQuest(quest: QuestTemplate | null): void {
		this._selectedQuest = quest;
	}

	/**
	 * Reset store
	 */
	reset(): void {
		this._availableQuests = [];
		this._activeQuests = [];
		this._selectedQuest = null;
	}
}

// Export singleton instance
export const questStore = new QuestStore();
