/**
 * DungeonProgress Repository
 * Data access layer for dungeon progress tracking
 */

import type Database from 'better-sqlite3';
import { getDatabase } from '../connection';

export interface DungeonProgress {
	id: number;
	character_id: number;
	dungeon_id: number;
	current_floor: number;
	status: 'active' | 'completed' | 'failed';
	monsters_defeated: number;
	loot_collected: string; // JSON string
	started_at: number;
	completed_at: number | null;
}

export interface LootCollected {
	items: Array<{
		item_template_id: number;
		quantity: number;
		name: string;
		rarity: string;
	}>;
	currency: number;
	xp: number;
}

export interface CreateDungeonProgressData {
	character_id: number;
	dungeon_id: number;
}

export interface UpdateDungeonProgressData {
	current_floor?: number;
	status?: 'active' | 'completed' | 'failed';
	monsters_defeated?: number;
	loot_collected?: LootCollected;
	completed_at?: number;
}

export class DungeonProgressRepository {
	private db: Database.Database;

	constructor(database?: Database.Database) {
		this.db = database || getDatabase();
	}

	/**
	 * Find progress by ID
	 */
	findById(id: number): DungeonProgress | null {
		const stmt = this.db.prepare('SELECT * FROM dungeon_progress WHERE id = ?');
		return (stmt.get(id) as DungeonProgress) || null;
	}

	/**
	 * Find active progress for a character
	 */
	findActiveByCharacterId(characterId: number): DungeonProgress | null {
		const stmt = this.db.prepare(
			"SELECT * FROM dungeon_progress WHERE character_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1"
		);
		return (stmt.get(characterId) as DungeonProgress) || null;
	}

	/**
	 * Find all progress for a character
	 */
	findByCharacterId(characterId: number, limit: number = 50): DungeonProgress[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE character_id = ?
			ORDER BY started_at DESC
			LIMIT ?
		`);
		return stmt.all(characterId, limit) as DungeonProgress[];
	}

	/**
	 * Find all progress for a dungeon
	 */
	findByDungeonId(dungeonId: number, limit: number = 100): DungeonProgress[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE dungeon_id = ?
			ORDER BY started_at DESC
			LIMIT ?
		`);
		return stmt.all(dungeonId, limit) as DungeonProgress[];
	}

	/**
	 * Find completed runs for a character in a specific dungeon
	 */
	findCompletedRuns(characterId: number, dungeonId: number): DungeonProgress[] {
		const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE character_id = ? AND dungeon_id = ? AND status = 'completed'
			ORDER BY completed_at DESC
		`);
		return stmt.all(characterId, dungeonId) as DungeonProgress[];
	}

	/**
	 * Create a new dungeon progress
	 */
	create(data: CreateDungeonProgressData): DungeonProgress {
		// Check if character already has an active dungeon run
		const activeProgress = this.findActiveByCharacterId(data.character_id);
		if (activeProgress) {
			throw new Error('Character already has an active dungeon run');
		}

		const stmt = this.db.prepare(`
			INSERT INTO dungeon_progress (
				character_id, dungeon_id, current_floor, status,
				monsters_defeated, loot_collected
			)
			VALUES (
				@character_id, @dungeon_id, 1, 'active', 0, @loot_collected
			)
		`);

		const emptyLoot: LootCollected = {
			items: [],
			currency: 0,
			xp: 0
		};

		const result = stmt.run({
			character_id: data.character_id,
			dungeon_id: data.dungeon_id,
			loot_collected: JSON.stringify(emptyLoot)
		});

		const progress = this.findById(result.lastInsertRowid as number);
		if (!progress) {
			throw new Error('Failed to create dungeon progress');
		}

		return progress;
	}

	/**
	 * Update dungeon progress
	 */
	update(id: number, data: UpdateDungeonProgressData): DungeonProgress {
		const updates: string[] = [];
		const params: Record<string, unknown> = { id };

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				updates.push(`${key} = @${key}`);
				params[key] = key === 'loot_collected' ? JSON.stringify(value) : value;
			}
		});

		if (updates.length === 0) {
			throw new Error('No fields to update');
		}

		const stmt = this.db.prepare(`
			UPDATE dungeon_progress
			SET ${updates.join(', ')}
			WHERE id = @id
		`);

		stmt.run(params);

		const progress = this.findById(id);
		if (!progress) {
			throw new Error('Dungeon progress not found after update');
		}

		return progress;
	}

	/**
	 * Increment monsters defeated
	 */
	incrementMonstersDefeated(id: number): DungeonProgress {
		const stmt = this.db.prepare(`
			UPDATE dungeon_progress
			SET monsters_defeated = monsters_defeated + 1
			WHERE id = ?
		`);

		stmt.run(id);

		const progress = this.findById(id);
		if (!progress) {
			throw new Error('Dungeon progress not found');
		}

		return progress;
	}

	/**
	 * Advance to next floor
	 */
	advanceToNextFloor(id: number): DungeonProgress {
		const stmt = this.db.prepare(`
			UPDATE dungeon_progress
			SET current_floor = current_floor + 1
			WHERE id = ?
		`);

		stmt.run(id);

		const progress = this.findById(id);
		if (!progress) {
			throw new Error('Dungeon progress not found');
		}

		return progress;
	}

	/**
	 * Add loot to collected items
	 */
	addLoot(id: number, newLoot: LootCollected): DungeonProgress {
		const progress = this.findById(id);
		if (!progress) {
			throw new Error('Dungeon progress not found');
		}

		const currentLoot = this.parseLootCollected(progress);

		// Merge loot
		currentLoot.currency += newLoot.currency;
		currentLoot.xp += newLoot.xp;

		// Merge items (combine quantities for same item_template_id)
		newLoot.items.forEach((newItem) => {
			const existingItem = currentLoot.items.find(
				(item) => item.item_template_id === newItem.item_template_id
			);

			if (existingItem) {
				existingItem.quantity += newItem.quantity;
			} else {
				currentLoot.items.push(newItem);
			}
		});

		return this.update(id, { loot_collected: currentLoot });
	}

	/**
	 * Complete dungeon run
	 */
	complete(id: number): DungeonProgress {
		return this.update(id, {
			status: 'completed',
			completed_at: Math.floor(Date.now() / 1000)
		});
	}

	/**
	 * Fail dungeon run
	 */
	fail(id: number): DungeonProgress {
		return this.update(id, {
			status: 'failed',
			completed_at: Math.floor(Date.now() / 1000)
		});
	}

	/**
	 * Delete progress
	 */
	delete(id: number): void {
		const stmt = this.db.prepare('DELETE FROM dungeon_progress WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Parse loot collected from JSON string
	 */
	parseLootCollected(progress: DungeonProgress): LootCollected {
		return JSON.parse(progress.loot_collected) as LootCollected;
	}

	/**
	 * Get dungeon statistics for a character
	 */
	getCharacterStats(characterId: number): {
		total_runs: number;
		completed_runs: number;
		failed_runs: number;
		active_runs: number;
		deepest_floor_reached: number;
		total_monsters_defeated: number;
	} {
		const stmt = this.db.prepare(`
			SELECT
				COUNT(*) as total_runs,
				SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_runs,
				SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
				SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_runs,
				MAX(current_floor) as deepest_floor_reached,
				SUM(monsters_defeated) as total_monsters_defeated
			FROM dungeon_progress
			WHERE character_id = ?
		`);

		return stmt.get(characterId) as {
			total_runs: number;
			completed_runs: number;
			failed_runs: number;
			active_runs: number;
			deepest_floor_reached: number;
			total_monsters_defeated: number;
		};
	}
}
