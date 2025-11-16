/**
 * Leaderboard Sync System
 * Syncs character data from SQLite to Redis sorted sets for fast leaderboard queries
 */

import { getDatabase } from '../../database/connection.js';
import { getRedisClient } from '../../websocket/redis.js';
import { logger } from '../../utils/logger.js';

export interface LeaderboardEntry {
	characterId: number;
	characterName: string;
	playerUsername: string;
	level: number;
	combatPower: number;
	maxFloorReached: number;
	className: string;
}

export type LeaderboardCategory = 'level' | 'combatPower' | 'dungeonFloor';

const LEADERBOARD_KEYS = {
	level: 'leaderboard:level',
	combatPower: 'leaderboard:combat_power',
	dungeonFloor: 'leaderboard:dungeon_floor'
} as const;

/**
 * Calculate combat power from character stats
 */
function calculateCombatPower(stats: {
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
	level: number;
}): number {
	// Formula: (STR + INT + DEX) * level + VIT * 2
	const { strength, intelligence, dexterity, vitality, level } = stats;
	return (strength + intelligence + dexterity) * level + vitality * 2;
}

/**
 * Sync all characters to Redis leaderboards
 */
export async function syncAllLeaderboards(): Promise<void> {
	const db = getDatabase();
	const redis = getRedisClient();

	try {
		logger.info('Starting full leaderboard sync...');

		// Query all active characters with their progress
		const characters = db
			.prepare(
				`
			SELECT
				c.id,
				c.name,
				c.level,
				c.strength,
				c.intelligence,
				c.dexterity,
				c.vitality,
				p.username,
				cc.name as class_name,
				COALESCE(MAX(dp.current_floor), 0) as max_floor_reached
			FROM characters c
			JOIN players p ON c.player_id = p.id
			JOIN character_classes cc ON c.class_id = cc.id
			LEFT JOIN dungeon_progress dp ON c.id = dp.character_id
			WHERE c.is_active = 1 AND p.is_active = 1
			GROUP BY c.id
			ORDER BY c.level DESC
		`
			)
			.all() as Array<{
			id: number;
			name: string;
			level: number;
			strength: number;
			intelligence: number;
			dexterity: number;
			vitality: number;
			username: string;
			class_name: string;
			max_floor_reached: number;
		}>;

		logger.info(`Syncing ${characters.length} characters to leaderboards`);

		// Clear existing leaderboards
		await redis.del(
			LEADERBOARD_KEYS.level,
			LEADERBOARD_KEYS.combatPower,
			LEADERBOARD_KEYS.dungeonFloor
		);

		// Sync each character
		for (const char of characters) {
			const combatPower = calculateCombatPower({
				strength: char.strength,
				intelligence: char.intelligence,
				dexterity: char.dexterity,
				vitality: char.vitality,
				level: char.level
			});

			const entry: LeaderboardEntry = {
				characterId: char.id,
				characterName: char.name,
				playerUsername: char.username,
				level: char.level,
				combatPower,
				maxFloorReached: char.max_floor_reached,
				className: char.class_name
			};

			// Store as JSON string with character ID as member
			const memberKey = `char:${char.id}`;
			const memberData = JSON.stringify(entry);

			// Add to all leaderboards
			await Promise.all([
				// Level leaderboard
				redis.zadd(LEADERBOARD_KEYS.level, char.level, memberKey),
				// Combat power leaderboard
				redis.zadd(LEADERBOARD_KEYS.combatPower, combatPower, memberKey),
				// Dungeon floor leaderboard
				redis.zadd(LEADERBOARD_KEYS.dungeonFloor, char.max_floor_reached, memberKey),
				// Store full character data
				redis.set(`leaderboard:data:${char.id}`, memberData, { EX: 3600 }) // 1 hour TTL
			]);
		}

		logger.info('Leaderboard sync complete');
	} catch (error) {
		logger.error('Error syncing leaderboards:', error);
		throw error;
	}
}

/**
 * Sync a single character to leaderboards
 */
export async function syncCharacterToLeaderboard(characterId: number): Promise<void> {
	const db = getDatabase();
	const redis = getRedisClient();

	try {
		const char = db
			.prepare(
				`
			SELECT
				c.id,
				c.name,
				c.level,
				c.strength,
				c.intelligence,
				c.dexterity,
				c.vitality,
				p.username,
				cc.name as class_name,
				COALESCE(MAX(dp.current_floor), 0) as max_floor_reached
			FROM characters c
			JOIN players p ON c.player_id = p.id
			JOIN character_classes cc ON c.class_id = cc.id
			LEFT JOIN dungeon_progress dp ON c.id = dp.character_id
			WHERE c.id = ? AND c.is_active = 1 AND p.is_active = 1
			GROUP BY c.id
		`
			)
			.get(characterId) as
			| {
					id: number;
					name: string;
					level: number;
					strength: number;
					intelligence: number;
					dexterity: number;
					vitality: number;
					username: string;
					class_name: string;
					max_floor_reached: number;
			  }
			| undefined;

		if (!char) {
			logger.warn(`Character ${characterId} not found or inactive, removing from leaderboards`);
			await removeCharacterFromLeaderboard(characterId);
			return;
		}

		const combatPower = calculateCombatPower({
			strength: char.strength,
			intelligence: char.intelligence,
			dexterity: char.dexterity,
			vitality: char.vitality,
			level: char.level
		});

		const entry: LeaderboardEntry = {
			characterId: char.id,
			characterName: char.name,
			playerUsername: char.username,
			level: char.level,
			combatPower,
			maxFloorReached: char.max_floor_reached,
			className: char.class_name
		};

		const memberKey = `char:${char.id}`;
		const memberData = JSON.stringify(entry);

		// Update all leaderboards
		await Promise.all([
			redis.zadd(LEADERBOARD_KEYS.level, char.level, memberKey),
			redis.zadd(LEADERBOARD_KEYS.combatPower, combatPower, memberKey),
			redis.zadd(LEADERBOARD_KEYS.dungeonFloor, char.max_floor_reached, memberKey),
			redis.set(`leaderboard:data:${char.id}`, memberData, { EX: 3600 })
		]);

		logger.debug(`Synced character ${char.name} to leaderboards`);
	} catch (error) {
		logger.error(`Error syncing character ${characterId} to leaderboards:`, error);
		throw error;
	}
}

/**
 * Remove a character from all leaderboards
 */
export async function removeCharacterFromLeaderboard(characterId: number): Promise<void> {
	const redis = getRedisClient();
	const memberKey = `char:${characterId}`;

	try {
		await Promise.all([
			redis.zrem(LEADERBOARD_KEYS.level, memberKey),
			redis.zrem(LEADERBOARD_KEYS.combatPower, memberKey),
			redis.zrem(LEADERBOARD_KEYS.dungeonFloor, memberKey),
			redis.del(`leaderboard:data:${characterId}`)
		]);

		logger.debug(`Removed character ${characterId} from leaderboards`);
	} catch (error) {
		logger.error(`Error removing character ${characterId} from leaderboards:`, error);
		throw error;
	}
}

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(
	category: LeaderboardCategory,
	start: number = 0,
	count: number = 100
): Promise<LeaderboardEntry[]> {
	const redis = getRedisClient();
	const key = LEADERBOARD_KEYS[category];

	try {
		// Get top members (reverse order for highest scores first)
		const members = await redis.zrange(key, start, start + count - 1, { REV: true });

		// Fetch full data for each member
		const entries: LeaderboardEntry[] = [];
		for (const memberKey of members) {
			const charId = memberKey.split(':')[1];
			const data = await redis.get(`leaderboard:data:${charId}`);
			if (data) {
				entries.push(JSON.parse(data));
			}
		}

		return entries;
	} catch (error) {
		logger.error(`Error fetching ${category} leaderboard:`, error);
		throw error;
	}
}

/**
 * Get character's rank in a category
 */
export async function getCharacterRank(
	characterId: number,
	category: LeaderboardCategory
): Promise<number | null> {
	const redis = getRedisClient();
	const key = LEADERBOARD_KEYS[category];
	const memberKey = `char:${characterId}`;

	try {
		const rank = await redis.zrevrank(key, memberKey);
		return rank !== null ? rank + 1 : null; // Convert to 1-based ranking
	} catch (error) {
		logger.error(`Error fetching rank for character ${characterId}:`, error);
		return null;
	}
}
