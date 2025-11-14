/**
 * Combat Instance Repository
 * Data access layer for dungeon combat operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface CombatInstance {
	id: number;
	character_id: number;
	monster_id: number;
	dungeon_floor_id: number;
	character_hp_start: number;
	character_hp_end: number;
	monster_hp_start: number;
	monster_hp_end: number;
	winner: 'character' | 'monster';
	combat_log: string; // JSON array of combat actions
	xp_gained: number;
	currency_gained: number;
	loot_items: string; // JSON array of item template IDs
	duration_ms: number;
	created_at: number;
}

export interface CombatAction {
	turn: number;
	actor: 'character' | 'monster';
	action: string;
	damage?: number;
	hp_remaining: number;
	message: string;
}

export interface CreateCombatInstanceData {
	character_id: number;
	monster_id: number;
	dungeon_floor_id: number;
	character_hp_start: number;
	character_hp_end: number;
	monster_hp_start: number;
	monster_hp_end: number;
	winner: 'character' | 'monster';
	combat_log: CombatAction[];
	xp_gained: number;
	currency_gained: number;
	loot_items: number[];
	duration_ms: number;
}

export class CombatInstanceRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find combat instance by ID
	 */
	findById(id: number): CombatInstance | null {
		const stmt = this.db.prepare('SELECT * FROM combat_instances WHERE id = ?');
		return (stmt.get(id) as CombatInstance) || null;
	}

	/**
	 * Find combat instances by character
	 */
	findByCharacter(characterId: number, limit: number = 100): CombatInstance[] {
		const stmt = this.db.prepare(`
			SELECT * FROM combat_instances
			WHERE character_id = ?
			ORDER BY created_at DESC
			LIMIT ?
		`);
		return stmt.all(characterId, limit) as CombatInstance[];
	}

	/**
	 * Find recent combat instances for a dungeon floor
	 */
	findByFloor(dungeonFloorId: number, limit: number = 100): CombatInstance[] {
		const stmt = this.db.prepare(`
			SELECT * FROM combat_instances
			WHERE dungeon_floor_id = ?
			ORDER BY created_at DESC
			LIMIT ?
		`);
		return stmt.all(dungeonFloorId, limit) as CombatInstance[];
	}

	/**
	 * Create a new combat instance
	 */
	create(data: CreateCombatInstanceData): CombatInstance {
		const stmt = this.db.prepare(`
			INSERT INTO combat_instances (
				character_id, monster_id, dungeon_floor_id,
				character_hp_start, character_hp_end,
				monster_hp_start, monster_hp_end,
				winner, combat_log,
				xp_gained, currency_gained, loot_items,
				duration_ms
			)
			VALUES (
				@character_id, @monster_id, @dungeon_floor_id,
				@character_hp_start, @character_hp_end,
				@monster_hp_start, @monster_hp_end,
				@winner, @combat_log,
				@xp_gained, @currency_gained, @loot_items,
				@duration_ms
			)
		`);

		const result = stmt.run({
			character_id: data.character_id,
			monster_id: data.monster_id,
			dungeon_floor_id: data.dungeon_floor_id,
			character_hp_start: data.character_hp_start,
			character_hp_end: data.character_hp_end,
			monster_hp_start: data.monster_hp_start,
			monster_hp_end: data.monster_hp_end,
			winner: data.winner,
			combat_log: JSON.stringify(data.combat_log),
			xp_gained: data.xp_gained,
			currency_gained: data.currency_gained,
			loot_items: JSON.stringify(data.loot_items),
			duration_ms: data.duration_ms
		});

		const combat = this.findById(result.lastInsertRowid as number);
		if (!combat) {
			throw new Error('Failed to create combat instance');
		}

		return combat;
	}

	/**
	 * Parse combat log from JSON string
	 */
	parseCombatLog(combat: CombatInstance): CombatAction[] {
		return JSON.parse(combat.combat_log) as CombatAction[];
	}

	/**
	 * Parse loot items from JSON string
	 */
	parseLootItems(combat: CombatInstance): number[] {
		return JSON.parse(combat.loot_items) as number[];
	}

	/**
	 * Get combat statistics for a character
	 */
	getCharacterStats(characterId: number): {
		total_combats: number;
		wins: number;
		losses: number;
		total_xp_gained: number;
		total_currency_gained: number;
	} {
		const stmt = this.db.prepare(`
			SELECT
				COUNT(*) as total_combats,
				SUM(CASE WHEN winner = 'character' THEN 1 ELSE 0 END) as wins,
				SUM(CASE WHEN winner = 'monster' THEN 1 ELSE 0 END) as losses,
				SUM(xp_gained) as total_xp_gained,
				SUM(currency_gained) as total_currency_gained
			FROM combat_instances
			WHERE character_id = ?
		`);

		return stmt.get(characterId) as {
			total_combats: number;
			wins: number;
			losses: number;
			total_xp_gained: number;
			total_currency_gained: number;
		};
	}

	/**
	 * Delete combat instance
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM combat_instances WHERE id = ?');
		stmt.run(id);
	}
}
