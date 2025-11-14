/**
 * DungeonCombatInstance Repository
 * Data access layer for dungeon combat operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface DungeonCombatInstance {
	id: number;
	character_id: number;
	monster_id: number;
	dungeon_progress_id: number;
	floor_number: number;
	character_hp_before: number;
	character_hp_after: number;
	monster_level: number;
	monster_hp: number;
	winner: 'character' | 'monster';
	combat_log: string; // JSON string
	rewards: string; // JSON string
	created_at: number;
	duration_ms: number;
}

export interface CombatAction {
	turn: number;
	actor: 'character' | 'monster';
	action: string;
	damage?: number;
	healing?: number;
	critical?: boolean;
	hp_remaining: number;
}

export interface CombatRewards {
	xp: number;
	currency: number;
	items: Array<{
		item_template_id: number;
		quantity: number;
		name: string;
		rarity: string;
	}>;
}

export interface CreateDungeonCombatInstanceData {
	character_id: number;
	monster_id: number;
	dungeon_progress_id: number;
	floor_number: number;
	character_hp_before: number;
	character_hp_after: number;
	monster_level: number;
	monster_hp: number;
	winner: 'character' | 'monster';
	combat_log: CombatAction[];
	rewards: CombatRewards;
	duration_ms: number;
}

export class DungeonCombatInstanceRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find combat instance by ID
	 */
	findById(id: number): DungeonCombatInstance | null {
		const stmt = this.db.prepare('SELECT * FROM dungeon_combat_instances WHERE id = ?');
		return (stmt.get(id) as DungeonCombatInstance) || null;
	}

	/**
	 * Find all combat instances for a character
	 */
	findByCharacterId(characterId: number, limit: number = 50): DungeonCombatInstance[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_combat_instances
			WHERE character_id = ?
			ORDER BY created_at DESC
			LIMIT ?
		`);
		return stmt.all(characterId, limit) as DungeonCombatInstance[];
	}

	/**
	 * Find all combat instances for a dungeon progress
	 */
	findByDungeonProgressId(dungeonProgressId: number): DungeonCombatInstance[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_combat_instances
			WHERE dungeon_progress_id = ?
			ORDER BY created_at ASC
		`);
		return stmt.all(dungeonProgressId) as DungeonCombatInstance[];
	}

	/**
	 * Find combat instances for a specific floor in a dungeon run
	 */
	findByProgressAndFloor(dungeonProgressId: number, floorNumber: number): DungeonCombatInstance[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_combat_instances
			WHERE dungeon_progress_id = ? AND floor_number = ?
			ORDER BY created_at ASC
		`);
		return stmt.all(dungeonProgressId, floorNumber) as DungeonCombatInstance[];
	}

	/**
	 * Create a new combat instance
	 */
	create(data: CreateDungeonCombatInstanceData): DungeonCombatInstance {
		const stmt = this.db.prepare(`
			INSERT INTO dungeon_combat_instances (
				character_id, monster_id, dungeon_progress_id, floor_number,
				character_hp_before, character_hp_after, monster_level, monster_hp,
				winner, combat_log, rewards, duration_ms
			)
			VALUES (
				@character_id, @monster_id, @dungeon_progress_id, @floor_number,
				@character_hp_before, @character_hp_after, @monster_level, @monster_hp,
				@winner, @combat_log, @rewards, @duration_ms
			)
		`);

		const result = stmt.run({
			character_id: data.character_id,
			monster_id: data.monster_id,
			dungeon_progress_id: data.dungeon_progress_id,
			floor_number: data.floor_number,
			character_hp_before: data.character_hp_before,
			character_hp_after: data.character_hp_after,
			monster_level: data.monster_level,
			monster_hp: data.monster_hp,
			winner: data.winner,
			combat_log: JSON.stringify(data.combat_log),
			rewards: JSON.stringify(data.rewards),
			duration_ms: data.duration_ms
		});

		const combat = this.findById(result.lastInsertRowid as number);
		if (!combat) {
			throw new Error('Failed to create combat instance');
		}

		return combat;
	}

	/**
	 * Delete combat instance
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM dungeon_combat_instances WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Parse combat log from JSON string
	 */
	parseCombatLog(combat: DungeonCombatInstance): CombatAction[] {
		return JSON.parse(combat.combat_log) as CombatAction[];
	}

	/**
	 * Parse rewards from JSON string
	 */
	parseRewards(combat: DungeonCombatInstance): CombatRewards {
		return JSON.parse(combat.rewards) as CombatRewards;
	}

	/**
	 * Get combat statistics for a character
	 */
	getCharacterStats(characterId: number): {
		total_combats: number;
		wins: number;
		losses: number;
		total_xp_earned: number;
		total_currency_earned: number;
		average_duration_ms: number;
	} {
		const stmt = this.db.prepare(`
			SELECT
				COUNT(*) as total_combats,
				SUM(CASE WHEN winner = 'character' THEN 1 ELSE 0 END) as wins,
				SUM(CASE WHEN winner = 'monster' THEN 1 ELSE 0 END) as losses,
				AVG(duration_ms) as average_duration_ms
			FROM dungeon_combat_instances
			WHERE character_id = ?
		`);

		const stats = stmt.get(characterId) as {
			total_combats: number;
			wins: number;
			losses: number;
			average_duration_ms: number;
		};

		// Calculate total rewards (requires parsing JSON)
		const combats = this.findByCharacterId(characterId, 1000);
		let total_xp_earned = 0;
		let total_currency_earned = 0;

		combats.forEach((combat) => {
			const rewards = this.parseRewards(combat);
			total_xp_earned += rewards.xp;
			total_currency_earned += rewards.currency;
		});

		return {
			...stats,
			total_xp_earned,
			total_currency_earned
		};
	}
}
