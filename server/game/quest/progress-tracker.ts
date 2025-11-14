/**
 * Quest Progress Tracker
 * Automatically updates quest progress based on game events
 */

import { getActiveQuests } from '../../database/repositories/character-quest';
import { updateProgress } from './manager';
import { logger } from '../../utils/logger';

export interface QuestProgressEvent {
	characterId: number;
	eventType: 'kill' | 'loot' | 'explore' | 'dungeon' | 'combat' | 'level';
	target: string;
	amount?: number;
}

/**
 * Update quest progress based on a game event
 */
export function updateQuestProgress(event: QuestProgressEvent): void {
	try {
		const { characterId, eventType, target, amount = 1 } = event;

		// Get all active quests for this character
		const activeQuests = getActiveQuests(characterId);

		if (activeQuests.length === 0) {
			return; // No active quests, nothing to update
		}

		// Update progress for each quest that has matching objectives
		for (const quest of activeQuests) {
			// Find matching objectives in this quest
			const matchingObjectives = quest.progress.filter(
				(obj) =>
					obj.type === eventType && (obj.target === target || obj.target === 'any')
			);

			// Update each matching objective
			for (const objective of matchingObjectives) {
				// Only update if not already complete
				if (objective.current < objective.required) {
					const updated = updateProgress(quest.id, eventType, objective.target, amount);

					if (updated) {
						logger.info('Quest progress updated', {
							characterId,
							questId: quest.id,
							objectiveType: eventType,
							target: objective.target,
							progress: `${objective.current + amount}/${objective.required}`
						});
					}
				}
			}
		}
	} catch (error) {
		logger.error('Failed to update quest progress', error as Error, { event });
	}
}

/**
 * Track monster kill event
 */
export function trackMonsterKill(characterId: number, monsterName: string): void {
	updateQuestProgress({
		characterId,
		eventType: 'kill',
		target: monsterName.toLowerCase(),
		amount: 1
	});

	// Also track generic "any" kills
	updateQuestProgress({
		characterId,
		eventType: 'kill',
		target: 'any',
		amount: 1
	});
}

/**
 * Track loot collection event
 */
export function trackLootCollected(
	characterId: number,
	itemName: string,
	quantity: number
): void {
	updateQuestProgress({
		characterId,
		eventType: 'loot',
		target: itemName.toLowerCase(),
		amount: quantity
	});

	// Also track generic "any" loot
	updateQuestProgress({
		characterId,
		eventType: 'loot',
		target: 'any',
		amount: quantity
	});
}

/**
 * Track combat event
 */
export function trackCombat(characterId: number): void {
	updateQuestProgress({
		characterId,
		eventType: 'combat',
		target: 'any',
		amount: 1
	});
}

/**
 * Track dungeon floor reached event
 */
export function trackDungeonFloor(characterId: number, floorNumber: number): void {
	updateQuestProgress({
		characterId,
		eventType: 'dungeon',
		target: `floor_${floorNumber}`,
		amount: 1
	});
}

/**
 * Track exploration event
 */
export function trackExploration(characterId: number, zoneName: string): void {
	updateQuestProgress({
		characterId,
		eventType: 'explore',
		target: zoneName.toLowerCase(),
		amount: 1
	});
}

/**
 * Track level up event
 */
export function trackLevelUp(characterId: number, newLevel: number): void {
	updateQuestProgress({
		characterId,
		eventType: 'level',
		target: 'character',
		amount: newLevel
	});
}
