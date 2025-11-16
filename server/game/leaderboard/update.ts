/**
 * Leaderboard Update Triggers
 * Automatic updates to leaderboards when character stats change
 */

import { syncCharacterToLeaderboard } from './sync.js';
import { logger } from '../../utils/logger.js';

/**
 * Trigger leaderboard update when character levels up
 */
export async function onCharacterLevelUp(characterId: number): Promise<void> {
	try {
		logger.debug(`Updating leaderboard for character ${characterId} (level up)`);
		await syncCharacterToLeaderboard(characterId);
	} catch (error) {
		logger.error(`Failed to update leaderboard on level up for character ${characterId}:`, error);
	}
}

/**
 * Trigger leaderboard update when character stats change
 */
export async function onCharacterStatsChanged(characterId: number): Promise<void> {
	try {
		logger.debug(`Updating leaderboard for character ${characterId} (stats changed)`);
		await syncCharacterToLeaderboard(characterId);
	} catch (error) {
		logger.error(
			`Failed to update leaderboard on stats change for character ${characterId}:`,
			error
		);
	}
}

/**
 * Trigger leaderboard update when character reaches new dungeon floor
 */
export async function onDungeonFloorReached(characterId: number, floor: number): Promise<void> {
	try {
		logger.debug(`Updating leaderboard for character ${characterId} (reached floor ${floor})`);
		await syncCharacterToLeaderboard(characterId);
	} catch (error) {
		logger.error(
			`Failed to update leaderboard on dungeon progress for character ${characterId}:`,
			error
		);
	}
}

/**
 * Trigger leaderboard update when character is created
 */
export async function onCharacterCreated(characterId: number): Promise<void> {
	try {
		logger.debug(`Adding character ${characterId} to leaderboards`);
		await syncCharacterToLeaderboard(characterId);
	} catch (error) {
		logger.error(`Failed to add character ${characterId} to leaderboards:`, error);
	}
}

/**
 * Trigger leaderboard update when character is deleted/deactivated
 */
export async function onCharacterDeleted(characterId: number): Promise<void> {
	try {
		logger.debug(`Removing character ${characterId} from leaderboards`);
		const { removeCharacterFromLeaderboard } = await import('./sync.js');
		await removeCharacterFromLeaderboard(characterId);
	} catch (error) {
		logger.error(`Failed to remove character ${characterId} from leaderboards:`, error);
	}
}
