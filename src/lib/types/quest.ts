/**
 * Quest Types
 * Type definitions for quest-related data structures
 */

export interface QuestTemplate {
	id: number;
	title: string;
	description: string;
	min_level: number;
	max_level: number | null;
	objectives: QuestObjective[];
	rewards: QuestRewards;
	zone_id: number;
	prerequisite_quest_id: number | null;
}

export interface QuestObjective {
	type: 'kill' | 'collect' | 'interact' | 'explore' | 'talk';
	target: string;
	count: number;
	current?: number;
}

export interface QuestRewards {
	xp: number;
	currency: number;
	items: { item_id: number; quantity: number }[];
}

export interface CharacterQuest {
	id: number;
	character_id: number;
	quest_template_id: number;
	status: QuestStatus;
	progress: Record<string, number>;
	started_at: number;
	completed_at: number | null;
}

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface QuestWithTemplate {
	quest: CharacterQuest;
	template: QuestTemplate;
	progress_percent: number;
	all_objectives_complete: boolean;
}

export interface StartQuestRequest {
	character_id: number;
	quest_template_id: number;
}

export interface UpdateQuestProgressRequest {
	quest_id: number;
	progress: Record<string, number>;
}

export interface CompleteQuestRequest {
	character_id: number;
	quest_id: number;
}

export interface CompleteQuestResponse {
	success: boolean;
	rewards: QuestRewards;
	level_up?: {
		new_level: number;
		stat_increases: Record<string, number>;
	};
}

/**
 * Check if all quest objectives are complete
 */
export function areObjectivesComplete(
	objectives: QuestObjective[],
	progress: Record<string, number>
): boolean {
	return objectives.every((objective) => {
		const key = `${objective.type}_${objective.target}`;
		const current = progress[key] || 0;
		return current >= objective.count;
	});
}

/**
 * Calculate quest progress percentage
 */
export function calculateQuestProgress(
	objectives: QuestObjective[],
	progress: Record<string, number>
): number {
	if (objectives.length === 0) return 0;

	let totalProgress = 0;
	for (const objective of objectives) {
		const key = `${objective.type}_${objective.target}`;
		const current = Math.min(progress[key] || 0, objective.count);
		totalProgress += current / objective.count;
	}

	return Math.floor((totalProgress / objectives.length) * 100);
}

/**
 * Format quest objective for display
 */
export function formatObjective(objective: QuestObjective, progress: Record<string, number>): string {
	const key = `${objective.type}_${objective.target}`;
	const current = progress[key] || 0;

	const actionText = {
		kill: 'Defeat',
		collect: 'Collect',
		interact: 'Interact with',
		explore: 'Explore',
		talk: 'Talk to'
	}[objective.type];

	return `${actionText} ${objective.target}: ${current}/${objective.count}`;
}
