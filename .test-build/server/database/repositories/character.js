"use strict";
/**
 * Character Repository
 * Data access layer for character operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterRepository = void 0;
const connection_1 = require("../connection");
class CharacterRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find character by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find character by name
     */
    findByName(name) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE name = ?');
        return stmt.get(name) || null;
    }
    /**
     * Find all characters for a player
     */
    findByPlayerId(playerId) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE player_id = ? ORDER BY created_at DESC');
        return stmt.all(playerId);
    }
    /**
     * Create a new character
     */
    create(data) {
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
        const character = this.findById(result.lastInsertRowid);
        if (!character) {
            throw new Error('Failed to create character');
        }
        return character;
    }
    /**
     * Update character data
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
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM characters WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Parse appearance from JSON string
     */
    parseAppearance(character) {
        return JSON.parse(character.appearance);
    }
    /**
     * Check if character name exists
     */
    nameExists(name) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM characters WHERE name = ?');
        const result = stmt.get(name);
        return result.count > 0;
    }
    /**
     * Get top characters by level (for leaderboards)
     */
    getTopByLevel(limit = 100) {
        const stmt = this.db.prepare(`
			SELECT * FROM characters
			ORDER BY level DESC, experience DESC
			LIMIT ?
		`);
        return stmt.all(limit);
    }
    /**
     * Update last played timestamp
     */
    updateLastPlayed(id) {
        const stmt = this.db.prepare('UPDATE characters SET last_played_at = unixepoch() WHERE id = ?');
        stmt.run(id);
    }
}
exports.CharacterRepository = CharacterRepository;
