/**
 * Quest Reward System
 * Handles distribution of quest rewards (XP, currency, items)
 */

import type { QuestRewards } from '$lib/types/quest';
import { updateCharacter, getCharacterById } from '../../database/repositories/character';
import { addItem } from '../../database/repositories/inventory-item';
import { shouldLevelUp, getLevelFromXP } from '../progression/experience';
import { logger } from '../../utils/logger';

export interface RewardResult {
	success: boolean;
	xpGained: number;
	currencyGained: number;
	itemsGained: Array<{ itemId: number; quantity: number }>;
	leveledUp: boolean;
	newLevel?: number;
	error?: string;
}

/**
 * Distribute quest rewards to character
 */
export async function distributeQuestRewards(
	characterId: number,
	rewards: QuestRewards
): Promise<RewardResult> {
	try {
		const character = getCharacterById(characterId);

		if (!character) {
			return {
				success: false,
				xpGained: 0,
				currencyGained: 0,
				itemsGained: [],
				leveledUp: false,
				error: 'Character not found'
			};
		}

		// Calculate new values
		const newXP = character.experience + rewards.xp;
		const newCurrency = character.currency + rewards.currency;
		const leveledUp = shouldLevelUp(newXP, character.level);
		const newLevel = leveledUp ? getLevelFromXP(newXP) : character.level;

		// Update character with new values
		const updates: any = {
			experience: newXP,
			currency: newCurrency
		};

		if (leveledUp) {
			updates.level = newLevel;
			logger.info('Character leveled up', {
				characterId,
				oldLevel: character.level,
				newLevel
			});
		}

		updateCharacter(characterId, updates);

		// Add items to inventory
		const itemsGained: Array<{ itemId: number; quantity: number }> = [];
		for (const itemReward of rewards.items) {
			addItem(characterId, itemReward.item_template_id, itemReward.quantity);
			itemsGained.push({
				itemId: itemReward.item_template_id,
				quantity: itemReward.quantity
			});
		}

		logger.info('Quest rewards distributed', {
			characterId,
			xp: rewards.xp,
			currency: rewards.currency,
			items: itemsGained.length,
			leveledUp
		});

		return {
			success: true,
			xpGained: rewards.xp,
			currencyGained: rewards.currency,
			itemsGained,
			leveledUp,
			newLevel: leveledUp ? newLevel : undefined
		};
	} catch (error) {
		logger.error('Failed to distribute quest rewards', error as Error, {
			characterId,
			rewards
		});

		return {
			success: false,
			xpGained: 0,
			currencyGained: 0,
			itemsGained: [],
			leveledUp: false,
			error: 'Failed to distribute rewards'
		};
	}
}

/**
 * Calculate bonus rewards based on performance
 * (e.g., completing quest quickly, not dying, etc.)
 */
export function calculateBonusRewards(
	baseRewards: QuestRewards,
	performanceMultiplier: number = 1.0
): QuestRewards {
	return {
		xp: Math.floor(baseRewards.xp * performanceMultiplier),
		currency: Math.floor(baseRewards.currency * performanceMultiplier),
		items: baseRewards.items // Items don't scale with performance
	};
}

/**
 * Validate reward amounts to prevent exploits
 */
export function validateRewards(rewards: QuestRewards, questLevel: number): boolean {
	// Max XP should be reasonable for quest level
	const maxXP = questLevel * 500;
	if (rewards.xp > maxXP) {
		logger.warn('Quest rewards exceed maximum XP', {
			questLevel,
			rewardXP: rewards.xp,
			maxXP
		});
		return false;
	}

	// Max currency should be reasonable
	const maxCurrency = questLevel * 100;
	if (rewards.currency > maxCurrency) {
		logger.warn('Quest rewards exceed maximum currency', {
			questLevel,
			rewardCurrency: rewards.currency,
			maxCurrency
		});
		return false;
	}

	// Item quantities should be reasonable
	for (const item of rewards.items) {
		if (item.quantity > 99) {
			logger.warn('Quest reward item quantity too high', {
				itemId: item.item_template_id,
				quantity: item.quantity
			});
			return false;
		}
	}

	return true;
}
