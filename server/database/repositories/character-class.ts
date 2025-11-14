/**
 * Character Class Repository
 * Data access layer for character class operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface CharacterClass {
	id: number;
	name: string;
	description: string;
	base_stats: string; // JSON string
	stat_growth: string; // JSON string
	starting_equipment: string; // JSON string
}

export interface BaseStats {
	hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
}

export interface StatGrowth {
	hp_per_level: number;
	strength_per_level: number;
	intelligence_per_level: number;
	dexterity_per_level: number;
	vitality_per_level: number;
}

export interface CreateCharacterClassData {
	name: string;
	description: string;
	base_stats: BaseStats;
	stat_growth: StatGrowth;
	starting_equipment: number[]; // Array of item template IDs
}

export class CharacterClassRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find character class by ID
	 */
	findById(id: number): CharacterClass | null {
		const stmt = this.db.prepare('SELECT * FROM character_classes WHERE id = ?');
		return (stmt.get(id) as CharacterClass) || null;
	}

	/**
	 * Find character class by name
	 */
	findByName(name: string): CharacterClass | null {
		const stmt = this.db.prepare('SELECT * FROM character_classes WHERE name = ?');
		return (stmt.get(name) as CharacterClass) || null;
	}

	/**
	 * Get all character classes
	 */
	findAll(): CharacterClass[] {
		const stmt = this.db.prepare('SELECT * FROM character_classes ORDER BY id');
		return stmt.all() as CharacterClass[];
	}

	/**
	 * Create a new character class
	 */
	create(data: CreateCharacterClassData): CharacterClass {
		const stmt = this.db.prepare(`
			INSERT INTO character_classes (name, description, base_stats, stat_growth, starting_equipment)
			VALUES (@name, @description, @base_stats, @stat_growth, @starting_equipment)
		`);

		const result = stmt.run({
			name: data.name,
			description: data.description,
			base_stats: JSON.stringify(data.base_stats),
			stat_growth: JSON.stringify(data.stat_growth),
			starting_equipment: JSON.stringify(data.starting_equipment)
		});

		const characterClass = this.findById(result.lastInsertRowid as number);
		if (!characterClass) {
			throw new Error('Failed to create character class');
		}

		return characterClass;
	}

	/**
	 * Parse base stats from JSON string
	 */
	parseBaseStats(characterClass: CharacterClass): BaseStats {
		return JSON.parse(characterClass.base_stats) as BaseStats;
	}

	/**
	 * Parse stat growth from JSON string
	 */
	parseStatGrowth(characterClass: CharacterClass): StatGrowth {
		return JSON.parse(characterClass.stat_growth) as StatGrowth;
	}

	/**
	 * Parse starting equipment from JSON string
	 */
	parseStartingEquipment(characterClass: CharacterClass): number[] {
		return JSON.parse(characterClass.starting_equipment) as number[];
	}

	/**
	 * Check if character class name exists
	 */
	nameExists(name: string): boolean {
		const stmt = this.db.prepare('SELECT COUNT(*) as count FROM character_classes WHERE name = ?');
		const result = stmt.get(name) as { count: number };
		return result.count > 0;
	}
}
