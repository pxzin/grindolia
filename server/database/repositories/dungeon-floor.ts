/**
 * DungeonFloor Repository
 * Data access layer for dungeon floor operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface DungeonFloor {
	id: number;
	dungeon_id: number;
	floor_number: number;
	difficulty_multiplier: number;
	monster_count: number;
	boss_monster_id: number | null;
	loot_table: string; // JSON string
	created_at: number;
}

export interface LootTable {
	items: Array<{
		item_template_id: number;
		drop_chance: number; // 0.0 to 1.0
		min_quantity: number;
		max_quantity: number;
		rarity: string;
	}>;
	currency_min: number;
	currency_max: number;
}

export interface CreateDungeonFloorData {
	dungeon_id: number;
	floor_number: number;
	difficulty_multiplier: number;
	monster_count: number;
	boss_monster_id?: number;
	loot_table: LootTable;
}

export interface UpdateDungeonFloorData {
	difficulty_multiplier?: number;
	monster_count?: number;
	boss_monster_id?: number;
	loot_table?: LootTable;
}

export class DungeonFloorRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find floor by ID
	 */
	findById(id: number): DungeonFloor | null {
		const stmt = this.db.prepare('SELECT * FROM dungeon_floors WHERE id = ?');
		return (stmt.get(id) as DungeonFloor) || null;
	}

	/**
	 * Find floor by dungeon and floor number
	 */
	findByDungeonAndFloor(dungeonId: number, floorNumber: number): DungeonFloor | null {
		const stmt = this.db.prepare(
			'SELECT * FROM dungeon_floors WHERE dungeon_id = ? AND floor_number = ?'
		);
		return (stmt.get(dungeonId, floorNumber) as DungeonFloor) || null;
	}

	/**
	 * Find all floors for a dungeon
	 */
	findByDungeonId(dungeonId: number): DungeonFloor[] {
		const stmt = this.db.prepare(
			'SELECT * FROM dungeon_floors WHERE dungeon_id = ? ORDER BY floor_number ASC'
		);
		return stmt.all(dungeonId) as DungeonFloor[];
	}

	/**
	 * Create a new dungeon floor
	 */
	create(data: CreateDungeonFloorData): DungeonFloor {
		const stmt = this.db.prepare(`
			INSERT INTO dungeon_floors (
				dungeon_id, floor_number, difficulty_multiplier, monster_count,
				boss_monster_id, loot_table
			)
			VALUES (
				@dungeon_id, @floor_number, @difficulty_multiplier, @monster_count,
				@boss_monster_id, @loot_table
			)
		`);

		const result = stmt.run({
			dungeon_id: data.dungeon_id,
			floor_number: data.floor_number,
			difficulty_multiplier: data.difficulty_multiplier,
			monster_count: data.monster_count,
			boss_monster_id: data.boss_monster_id || null,
			loot_table: JSON.stringify(data.loot_table)
		});

		const floor = this.findById(result.lastInsertRowid as number);
		if (!floor) {
			throw new Error('Failed to create dungeon floor');
		}

		return floor;
	}

	/**
	 * Update dungeon floor data
	 */
	update(id: number, data: UpdateDungeonFloorData): DungeonFloor {
		const updates: string[] = [];
		const params: Record<string, unknown> = { id };

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				updates.push(`${key} = @${key}`);
				params[key] = key === 'loot_table' ? JSON.stringify(value) : value;
			}
		});

		if (updates.length === 0) {
			throw new Error('No fields to update');
		}

		const stmt = this.db.prepare(`
			UPDATE dungeon_floors
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const floor = this.findById(id);
		if (!floor) {
			throw new Error('Dungeon floor not found after update');
		}

		return floor;
	}

	/**
	 * Delete dungeon floor
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM dungeon_floors WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Parse loot table from JSON string
	 */
	parseLootTable(floor: DungeonFloor): LootTable {
		return JSON.parse(floor.loot_table) as LootTable;
	}

	/**
	 * Get max floor number for a dungeon
	 */
	getMaxFloorNumber(dungeonId: number): number {
		const stmt = this.db.prepare(
			'SELECT MAX(floor_number) as max_floor FROM dungeon_floors WHERE dungeon_id = ?'
		);
		const result = stmt.get(dungeonId) as { max_floor: number | null };
		return result.max_floor || 0;
	}
}
