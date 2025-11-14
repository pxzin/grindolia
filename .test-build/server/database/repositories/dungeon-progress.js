"use strict";
/**
 * DungeonProgress Repository
 * Data access layer for dungeon progress tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DungeonProgressRepository = void 0;
const connection_1 = require("../connection");
class DungeonProgressRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find progress by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM dungeon_progress WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find active progress for a character
     */
    findActiveByCharacterId(characterId) {
        const stmt = this.db.prepare("SELECT * FROM dungeon_progress WHERE character_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1");
        return stmt.get(characterId) || null;
    }
    /**
     * Find all progress for a character
     */
    findByCharacterId(characterId, limit = 50) {
        const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE character_id = ?
			ORDER BY started_at DESC
			LIMIT ?
		`);
        return stmt.all(characterId, limit);
    }
    /**
     * Find all progress for a dungeon
     */
    findByDungeonId(dungeonId, limit = 100) {
        const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE dungeon_id = ?
			ORDER BY started_at DESC
			LIMIT ?
		`);
        return stmt.all(dungeonId, limit);
    }
    /**
     * Find completed runs for a character in a specific dungeon
     */
    findCompletedRuns(characterId, dungeonId) {
        const stmt = this.db.prepare(`
			SELECT * FROM dungeon_progress
			WHERE character_id = ? AND dungeon_id = ? AND status = 'completed'
			ORDER BY completed_at DESC
		`);
        return stmt.all(characterId, dungeonId);
    }
    /**
     * Create a new dungeon progress
     */
    create(data) {
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
        const emptyLoot = {
            items: [],
            currency: 0,
            xp: 0
        };
        const result = stmt.run({
            character_id: data.character_id,
            dungeon_id: data.dungeon_id,
            loot_collected: JSON.stringify(emptyLoot)
        });
        const progress = this.findById(result.lastInsertRowid);
        if (!progress) {
            throw new Error('Failed to create dungeon progress');
        }
        return progress;
    }
    /**
     * Update dungeon progress
     */
    update(id, data) {
        const updates = [];
        const params = { id };
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
    incrementMonstersDefeated(id) {
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
    advanceToNextFloor(id) {
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
    addLoot(id, newLoot) {
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
            const existingItem = currentLoot.items.find((item) => item.item_template_id === newItem.item_template_id);
            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            }
            else {
                currentLoot.items.push(newItem);
            }
        });
        return this.update(id, { loot_collected: currentLoot });
    }
    /**
     * Complete dungeon run
     */
    complete(id) {
        return this.update(id, {
            status: 'completed',
            completed_at: Math.floor(Date.now() / 1000)
        });
    }
    /**
     * Fail dungeon run
     */
    fail(id) {
        return this.update(id, {
            status: 'failed',
            completed_at: Math.floor(Date.now() / 1000)
        });
    }
    /**
     * Delete progress
     */
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM dungeon_progress WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Parse loot collected from JSON string
     */
    parseLootCollected(progress) {
        return JSON.parse(progress.loot_collected);
    }
    /**
     * Get dungeon statistics for a character
     */
    getCharacterStats(characterId) {
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
        return stmt.get(characterId);
    }
    /**
     * Find active dungeon progress (alias for compatibility)
     */
    findActive(characterId) {
        return this.findActiveByCharacterId(characterId);
    }
    /**
     * Descend to next floor (alias for compatibility)
     */
    descendFloor(id) {
        return this.advanceToNextFloor(id);
    }
    /**
     * Mark dungeon as abandoned (alias for compatibility)
     */
    markAbandoned(id) {
        return this.update(id, {
            status: 'failed',
            completed_at: Math.floor(Date.now() / 1000)
        });
    }
}
exports.DungeonProgressRepository = DungeonProgressRepository;
