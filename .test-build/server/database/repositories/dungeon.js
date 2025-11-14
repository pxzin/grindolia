"use strict";
/**
 * Dungeon Repository
 * Data access layer for dungeon operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DungeonRepository = void 0;
const connection_1 = require("../connection");
class DungeonRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find dungeon by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM dungeons WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find dungeon by name
     */
    findByName(name) {
        const stmt = this.db.prepare('SELECT * FROM dungeons WHERE name = ?');
        return stmt.get(name) || null;
    }
    /**
     * Find all dungeons
     */
    findAll() {
        const stmt = this.db.prepare('SELECT * FROM dungeons ORDER BY min_level ASC');
        return stmt.all();
    }
    /**
     * Find dungeons available for character level
     */
    findByLevelRange(level) {
        const stmt = this.db.prepare('SELECT * FROM dungeons WHERE min_level <= ? ORDER BY min_level ASC');
        return stmt.all(level);
    }
    /**
     * Create a new dungeon
     */
    create(data) {
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
        const dungeon = this.findById(result.lastInsertRowid);
        if (!dungeon) {
            throw new Error('Failed to create dungeon');
        }
        return dungeon;
    }
    /**
     * Update dungeon data
     */
    update(id, data) {
        const updates = [];
        const params = { id };
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
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM dungeons WHERE id = ?');
        stmt.run(id);
    }
}
exports.DungeonRepository = DungeonRepository;
