/**
 * Quest Manager
 * Handles quest acceptance, progress tracking, and completion
 */

import type { QuestObjective } from '$lib/types/quest';
import { getQuestTemplateById } from '../../database/repositories/quest-template';
import {
	createCharacterQuest,
	getCharacterQuestById,
	hasQuest,
	getLastCompletionTime,
	updateQuestProgress,
	completeQuest as markQuestComplete,
	abandonQuest
} from '../../database/repositories/character-quest';
import { CharacterRepository } from '../../database/repositories/character';
import { getDatabase } from '../../database/connection';
import { distributeQuestRewards } from './rewards';
import { logger } from '../../utils/logger';
import { areObjectivesComplete } from '$lib/types/quest';

export interface AcceptQuestResult {
	success: boolean;
	questId?: number;
	error?: string;
}

export interface CompleteQuestResult {
	success: boolean;
	rewards?: {
		xpGained: number;
		currencyGained: number;
		itemsGained: Array<{ itemId: number; quantity: number }>;
		leveledUp: boolean;
		newLevel?: number;
	};
	error?: string;
}

/**
 * Accept a quest
 */
export function acceptQuest(characterId: number, questTemplateId: number): AcceptQuestResult {
	try {
		// Get character
		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);
		const character = characterRepo.findById(characterId);
		if (!character) {
			return { success: false, error: 'Character not found' };
		}

		// Get quest template
		const questTemplate = getQuestTemplateById(questTemplateId);
		if (!questTemplate) {
			return { success: false, error: 'Quest not found' };
		}

		// Check if character already has this quest
		if (hasQuest(characterId, questTemplateId)) {
			return { success: false, error: 'Quest already active' };
		}

		// Check level requirements
		if (character.level < questTemplate.min_level) {
			return {
				success: false,
				error: `Level ${questTemplate.min_level} required`
			};
		}

		if (questTemplate.max_level && character.level > questTemplate.max_level) {
			return {
				success: false,
				error: `Quest not available for level ${character.level}`
			};
		}

		// Check cooldown for repeatable quests
		if (questTemplate.is_repeatable && questTemplate.cooldown_hours) {
			const lastCompletion = getLastCompletionTime(characterId, questTemplateId);
			if (lastCompletion) {
				const now = Math.floor(Date.now() / 1000);
				const cooldownSeconds = questTemplate.cooldown_hours * 3600;
				const timeSinceCompletion = now - lastCompletion;

				if (timeSinceCompletion < cooldownSeconds) {
					const remainingHours = Math.ceil((cooldownSeconds - timeSinceCompletion) / 3600);
					return {
						success: false,
						error: `Quest on cooldown (${remainingHours}h remaining)`
					};
				}
			}
		}

		// Initialize quest progress
		const initialProgress: QuestObjective[] = questTemplate.objectives.map(obj => ({
			...obj,
			current: 0
		}));

		// Create character quest
		const characterQuest = createCharacterQuest(characterId, questTemplateId, initialProgress);

		logger.info('Quest accepted', {
			characterId,
			questTemplateId,
			questTitle: questTemplate.title
		});

		return {
			success: true,
			questId: characterQuest.id
		};
	} catch (error) {
		logger.error('Failed to accept quest', error as Error, {
			characterId,
			questTemplateId
		});

		return {
			success: false,
			error: 'Failed to accept quest'
		};
	}
}

/**
 * Update quest progress
 */
export function updateProgress(
	characterQuestId: number,
	objectiveType: string,
	target: string,
	amount: number = 1
): boolean {
	try {
		const characterQuest = getCharacterQuestById(characterQuestId);
		if (!characterQuest) {
			logger.warn('Character quest not found', { characterQuestId });
			return false;
		}

		if (characterQuest.status !== 'in_progress') {
			logger.warn('Quest not in progress', {
				characterQuestId,
				status: characterQuest.status
			});
			return false;
		}

		// Find matching objective
		const objective = characterQuest.progress.find(
			obj => obj.type === objectiveType && obj.target === target
		);

		if (!objective) {
			logger.warn('Objective not found in quest', {
				characterQuestId,
				objectiveType,
				target
			});
			return false;
		}

		// Update progress
		objective.current = Math.min(objective.current + amount, objective.required);

		// Save updated progress
		const success = updateQuestProgress(characterQuestId, characterQuest.progress);

		if (success) {
			logger.info('Quest progress updated', {
				characterQuestId,
				objectiveType,
				target,
				current: objective.current,
				required: objective.required
			});
		}

		return success;
	} catch (error) {
		logger.error('Failed to update quest progress', error as Error, {
			characterQuestId,
			objectiveType,
			target,
			amount
		});
		return false;
	}
}

/**
 * Complete a quest
 */
export async function completeQuest(characterQuestId: number): Promise<CompleteQuestResult> {
	try {
		const characterQuest = getCharacterQuestById(characterQuestId);
		if (!characterQuest) {
			return { success: false, error: 'Quest not found' };
		}

		if (characterQuest.status !== 'in_progress') {
			return { success: false, error: 'Quest not in progress' };
		}

		// Check if all objectives are complete
		if (!areObjectivesComplete(characterQuest.progress)) {
			return { success: false, error: 'Quest objectives not completed' };
		}

		// Get quest template for rewards
		const questTemplate = getQuestTemplateById(characterQuest.quest_template_id);
		if (!questTemplate) {
			return { success: false, error: 'Quest template not found' };
		}

		// Distribute rewards
		const rewardResult = await distributeQuestRewards(
			characterQuest.character_id,
			questTemplate.rewards
		);

		if (!rewardResult.success) {
			return { success: false, error: rewardResult.error };
		}

		// Mark quest as complete
		markQuestComplete(characterQuestId);

		logger.info('Quest completed', {
			characterQuestId,
			characterId: characterQuest.character_id,
			questTitle: questTemplate.title,
			rewards: rewardResult
		});

		return {
			success: true,
			rewards: rewardResult
		};
	} catch (error) {
		logger.error('Failed to complete quest', error as Error, { characterQuestId });

		return {
			success: false,
			error: 'Failed to complete quest'
		};
	}
}

/**
 * Abandon a quest
 */
export function abandon(characterQuestId: number): boolean {
	try {
		const characterQuest = getCharacterQuestById(characterQuestId);
		if (!characterQuest) {
			logger.warn('Character quest not found', { characterQuestId });
			return false;
		}

		if (characterQuest.status !== 'in_progress') {
			logger.warn('Cannot abandon quest that is not in progress', {
				characterQuestId,
				status: characterQuest.status
			});
			return false;
		}

		const success = abandonQuest(characterQuestId);

		if (success) {
			logger.info('Quest abandoned', {
				characterQuestId,
				characterId: characterQuest.character_id
			});
		}

		return success;
	} catch (error) {
		logger.error('Failed to abandon quest', error as Error, { characterQuestId });
		return false;
	}
}
