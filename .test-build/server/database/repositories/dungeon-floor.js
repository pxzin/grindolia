"use strict";
/**
 * DungeonFloor Repository
 * Data access layer for dungeon floor operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DungeonFloorRepository = void 0;
const connection_1 = require("../connection");
class DungeonFloorRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find floor by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM dungeon_floors WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find floor by dungeon and floor number
     */
    findByDungeonAndFloor(dungeonId, floorNumber) {
        const stmt = this.db.prepare('SELECT * FROM dungeon_floors WHERE dungeon_id = ? AND floor_number = ?');
        return stmt.get(dungeonId, floorNumber) || null;
    }
    /**
     * Find all floors for a dungeon
     */
    findByDungeonId(dungeonId) {
        const stmt = this.db.prepare('SELECT * FROM dungeon_floors WHERE dungeon_id = ? ORDER BY floor_number ASC');
        return stmt.all(dungeonId);
    }
    /**
     * Create a new dungeon floor
     */
    create(data) {
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
        const floor = this.findById(result.lastInsertRowid);
        if (!floor) {
            throw new Error('Failed to create dungeon floor');
        }
        return floor;
    }
    /**
     * Update dungeon floor data
     */
    update(id, data) {
        const updates = [];
        const params = { id };
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
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM dungeon_floors WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Parse loot table from JSON string
     */
    parseLootTable(floor) {
        return JSON.parse(floor.loot_table);
    }
    /**
     * Get max floor number for a dungeon
     */
    getMaxFloorNumber(dungeonId) {
        const stmt = this.db.prepare('SELECT MAX(floor_number) as max_floor FROM dungeon_floors WHERE dungeon_id = ?');
        const result = stmt.get(dungeonId);
        return result.max_floor || 0;
    }
}
exports.DungeonFloorRepository = DungeonFloorRepository;
