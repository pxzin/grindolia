/**
 * Monster Repository
 * Data access layer for monster operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface Monster {
	id: number;
	name: string;
	description: string;
	base_level: number;
	base_hp: number;
	base_strength: number;
	base_intelligence: number;
	base_dexterity: number;
	xp_reward: number;
	currency_reward: number;
	loot_table: string | null; // JSON string
	monster_type: string;
	created_at: number;
}

export interface MonsterLootTable {
	items: Array<{
		item_template_id: number;
		drop_chance: number; // 0.0 to 1.0
		min_quantity: number;
		max_quantity: number;
	}>;
}

export interface CreateMonsterData {
	name: string;
	description: string;
	base_level: number;
	base_hp: number;
	base_strength: number;
	base_intelligence: number;
	base_dexterity: number;
	xp_reward: number;
	currency_reward: number;
	loot_table?: MonsterLootTable;
	monster_type: string;
}

export interface UpdateMonsterData {
	name?: string;
	description?: string;
	base_level?: number;
	base_hp?: number;
	base_strength?: number;
	base_intelligence?: number;
	base_dexterity?: number;
	xp_reward?: number;
	currency_reward?: number;
	loot_table?: MonsterLootTable;
	monster_type?: string;
}

export class MonsterRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find monster by ID
	 */
	findById(id: number): Monster | null {
		const stmt = this.db.prepare('SELECT * FROM monsters WHERE id = ?');
		return (stmt.get(id) as Monster) || null;
	}

	/**
	 * Find monster by name
	 */
	findByName(name: string): Monster | null {
		const stmt = this.db.prepare('SELECT * FROM monsters WHERE name = ?');
		return (stmt.get(name) as Monster) || null;
	}

	/**
	 * Find all monsters
	 */
	findAll(): Monster[] {
		const stmt = this.db.prepare('SELECT * FROM monsters ORDER BY base_level ASC, name ASC');
		return stmt.all() as Monster[];
	}

	/**
	 * Find monsters by type
	 */
	findByType(monsterType: string): Monster[] {
		const stmt = this.db.prepare('SELECT * FROM monsters WHERE monster_type = ? ORDER BY base_level ASC');
		return stmt.all(monsterType) as Monster[];
	}

	/**
	 * Find monsters by level range
	 */
	findByLevelRange(minLevel: number, maxLevel: number): Monster[] {
		const stmt = this.db.prepare(
			'SELECT * FROM monsters WHERE base_level BETWEEN ? AND ? ORDER BY base_level ASC'
		);
		return stmt.all(minLevel, maxLevel) as Monster[];
	}

	/**
	 * Find monsters by exact level
	 */
	findByLevel(level: number): Monster[] {
		const stmt = this.db.prepare('SELECT * FROM monsters WHERE base_level = ? ORDER BY name ASC');
		return stmt.all(level) as Monster[];
	}

	/**
	 * Create a new monster
	 */
	create(data: CreateMonsterData): Monster {
		const stmt = this.db.prepare(`
			INSERT INTO monsters (
				name, description, base_level, base_hp, base_strength,
				base_intelligence, base_dexterity, xp_reward, currency_reward,
				loot_table, monster_type
			)
			VALUES (
				@name, @description, @base_level, @base_hp, @base_strength,
				@base_intelligence, @base_dexterity, @xp_reward, @currency_reward,
				@loot_table, @monster_type
			)
		`);

		const result = stmt.run({
			name: data.name,
			description: data.description,
			base_level: data.base_level,
			base_hp: data.base_hp,
			base_strength: data.base_strength,
			base_intelligence: data.base_intelligence,
			base_dexterity: data.base_dexterity,
			xp_reward: data.xp_reward,
			currency_reward: data.currency_reward,
			loot_table: data.loot_table ? JSON.stringify(data.loot_table) : null,
			monster_type: data.monster_type
		});

		const monster = this.findById(result.lastInsertRowid as number);
		if (!monster) {
			throw new Error('Failed to create monster');
		}

		return monster;
	}

	/**
	 * Update monster data
	 */
	update(id: number, data: UpdateMonsterData): Monster {
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
			UPDATE monsters
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const monster = this.findById(id);
		if (!monster) {
			throw new Error('Monster not found after update');
		}

		return monster;
	}

	/**
	 * Delete monster
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM monsters WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Parse loot table from JSON string
	 */
	parseLootTable(monster: Monster): MonsterLootTable | null {
		if (!monster.loot_table) {
			return null;
		}
		return JSON.parse(monster.loot_table) as MonsterLootTable;
	}

	/**
	 * Calculate scaled stats for a monster at a specific level
	 */
	calculateScaledStats(
		monster: Monster,
		level: number,
		difficultyMultiplier: number = 1.0
	): {
		hp: number;
		strength: number;
		intelligence: number;
		dexterity: number;
		xp_reward: number;
		currency_reward: number;
	} {
		const levelDiff = level - monster.base_level;
		const scalingFactor = 1 + levelDiff * 0.1; // 10% per level
		const totalMultiplier = scalingFactor * difficultyMultiplier;

		return {
			hp: Math.floor(monster.base_hp * totalMultiplier),
			strength: Math.floor(monster.base_strength * totalMultiplier),
			intelligence: Math.floor(monster.base_intelligence * totalMultiplier),
			dexterity: Math.floor(monster.base_dexterity * totalMultiplier),
			xp_reward: Math.floor(monster.xp_reward * totalMultiplier),
			currency_reward: Math.floor(monster.currency_reward * totalMultiplier)
		};
	}
}
