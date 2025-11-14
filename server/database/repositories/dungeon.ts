/**
 * Dungeon Repository
 * Data access layer for dungeon operations
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface Dungeon {
	id: number;
	name: string;
	description: string;
	min_level: number;
	max_floors: number;
	theme: string;
	created_at: number;
}

export interface CreateDungeonData {
	name: string;
	description: string;
	min_level: number;
	max_floors: number;
	theme: string;
}

export interface UpdateDungeonData {
	name?: string;
	description?: string;
	min_level?: number;
	max_floors?: number;
	theme?: string;
}

export class DungeonRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find dungeon by ID
	 */
	findById(id: number): Dungeon | null {
		const stmt = this.db.prepare('SELECT * FROM dungeons WHERE id = ?');
		return (stmt.get(id) as Dungeon) || null;
	}

	/**
	 * Find dungeon by name
	 */
	findByName(name: string): Dungeon | null {
		const stmt = this.db.prepare('SELECT * FROM dungeons WHERE name = ?');
		return (stmt.get(name) as Dungeon) || null;
	}

	/**
	 * Find all dungeons
	 */
	findAll(): Dungeon[] {
		const stmt = this.db.prepare('SELECT * FROM dungeons ORDER BY min_level ASC');
		return stmt.all() as Dungeon[];
	}

	/**
	 * Find dungeons available for character level
	 */
	findByLevelRange(level: number): Dungeon[] {
		const stmt = this.db.prepare('SELECT * FROM dungeons WHERE min_level <= ? ORDER BY min_level ASC');
		return stmt.all(level) as Dungeon[];
	}

	/**
	 * Create a new dungeon
	 */
	create(data: CreateDungeonData): Dungeon {
		const stmt = this.db.prepare(`
			INSERT INTO dungeons (name, description, min_level, max_floors, theme)
			VALUES (@name, @description, @min_level, @max_floors, @theme)
		`);

		const result = stmt.run({
			name: data.name,
			description: data.description,
			min_level: data.min_level,
			max_floors: data.max_floors,
			theme: data.theme
		});

		const dungeon = this.findById(result.lastInsertRowid as number);
		if (!dungeon) {
			throw new Error('Failed to create dungeon');
		}

		return dungeon;
	}

	/**
	 * Update dungeon data
	 */
	update(id: number, data: UpdateDungeonData): Dungeon {
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
			UPDATE dungeons
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const dungeon = this.findById(id);
		if (!dungeon) {
			throw new Error('Dungeon not found after update');
		}

		return dungeon;
	}

	/**
	 * Delete dungeon
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM dungeons WHERE id = ?');
		stmt.run(id);
	}
}
