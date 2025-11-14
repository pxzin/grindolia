/**
 * Character Repository
 * Data access layer for character operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface Character {
	id: number;
	player_id: number;
	class_id: number;
	name: string;
	level: number;
	experience: number;
	experience_to_next_level: number;
	current_hp: number;
	max_hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
	currency: number;
	appearance: string; // JSON string
	created_at: number;
	last_played_at: number | null;
}

export interface CharacterAppearance {
	skin_tone: string;
	hair_color: string;
	face: string;
	[key: string]: string;
}

export interface CreateCharacterData {
	player_id: number;
	class_id: number;
	name: string;
	experience_to_next_level: number;
	current_hp: number;
	max_hp: number;
	strength: number;
	intelligence: number;
	dexterity: number;
	vitality: number;
	appearance: CharacterAppearance;
}

export interface UpdateCharacterData {
	level?: number;
	experience?: number;
	experience_to_next_level?: number;
	current_hp?: number;
	max_hp?: number;
	strength?: number;
	intelligence?: number;
	dexterity?: number;
	vitality?: number;
	currency?: number;
	last_played_at?: number;
}

export class CharacterRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find character by ID
	 */
	findById(id: number): Character | null {
		const stmt = this.db.prepare('SELECT * FROM characters WHERE id = ?');
		return (stmt.get(id) as Character) || null;
	}

	/**
	 * Find character by name
	 */
	findByName(name: string): Character | null {
		const stmt = this.db.prepare('SELECT * FROM characters WHERE name = ?');
		return (stmt.get(name) as Character) || null;
	}

	/**
	 * Find all characters for a player
	 */
	findByPlayerId(playerId: number): Character[] {
		const stmt = this.db.prepare('SELECT * FROM characters WHERE player_id = ? ORDER BY created_at DESC');
		return stmt.all(playerId) as Character[];
	}

	/**
	 * Create a new character
	 */
	create(data: CreateCharacterData): Character {
		const stmt = this.db.prepare(`
			INSERT INTO characters (
				player_id, class_id, name, level, experience, experience_to_next_level,
				current_hp, max_hp, strength, intelligence, dexterity, vitality,
				currency, appearance
			)
			VALUES (
				@player_id, @class_id, @name, 1, 0, @experience_to_next_level,
				@current_hp, @max_hp, @strength, @intelligence, @dexterity, @vitality,
				0, @appearance
			)
		`);

		const result = stmt.run({
			player_id: data.player_id,
			class_id: data.class_id,
			name: data.name,
			experience_to_next_level: data.experience_to_next_level,
			current_hp: data.current_hp,
			max_hp: data.max_hp,
			strength: data.strength,
			intelligence: data.intelligence,
			dexterity: data.dexterity,
			vitality: data.vitality,
			appearance: JSON.stringify(data.appearance)
		});

		const character = this.findById(result.lastInsertRowid as number);
		if (!character) {
			throw new Error('Failed to create character');
		}

		return character;
	}

	/**
	 * Update character data
	 */
	update(id: number, data: UpdateCharacterData): Character {
		const updates: string[] = [];
		const params: Record<string, unknown> = { id };

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				updates.push(`${key} = @${key}`);
				params[key] = value;
			}
		});

		if (updates.length === 0) {
			throw new Error('No fields to update');
		}

		const stmt = this.db.prepare(`
			UPDATE characters
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const character = this.findById(id);
		if (!character) {
			throw new Error('Character not found after update');
		}

		return character;
	}

	/**
	 * Delete character
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM characters WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Parse appearance from JSON string
	 */
	parseAppearance(character: Character): CharacterAppearance {
		return JSON.parse(character.appearance) as CharacterAppearance;
	}

	/**
	 * Check if character name exists
	 */
	nameExists(name: string): boolean {
		const stmt = this.db.prepare('SELECT COUNT(*) as count FROM characters WHERE name = ?');
		const result = stmt.get(name) as { count: number };
		return result.count > 0;
	}

	/**
	 * Get top characters by level (for leaderboards)
	 */
	getTopByLevel(limit: number = 100): Character[] {
		const stmt = this.db.prepare(`
			SELECT * FROM characters
			ORDER BY level DESC, experience DESC
			LIMIT ?
		`);
		return stmt.all(limit) as Character[];
	}

	/**
	 * Update last played timestamp
	 */
	updateLastPlayed(id: number): void {
		const stmt = this.db.prepare('UPDATE characters SET last_played_at = unixepoch() WHERE id = ?');
		stmt.run(id);
	}
}
