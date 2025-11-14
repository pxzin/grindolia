"use strict";
/**
 * Character Class Repository
 * Data access layer for character class operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterClassRepository = void 0;
const connection_1 = require("../connection");
class CharacterClassRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find character class by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM character_classes WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find character class by name
     */
    findByName(name) {
        const stmt = this.db.prepare('SELECT * FROM character_classes WHERE name = ?');
        return stmt.get(name) || null;
    }
    /**
     * Get all character classes
     */
    findAll() {
        const stmt = this.db.prepare('SELECT * FROM character_classes ORDER BY id');
        return stmt.all();
    }
    /**
     * Create a new character class
     */
    create(data) {
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
        const characterClass = this.findById(result.lastInsertRowid);
        if (!characterClass) {
            throw new Error('Failed to create character class');
        }
        return characterClass;
    }
    /**
     * Parse base stats from JSON string
     */
    parseBaseStats(characterClass) {
        return JSON.parse(characterClass.base_stats);
    }
    /**
     * Parse stat growth from JSON string
     */
    parseStatGrowth(characterClass) {
        return JSON.parse(characterClass.stat_growth);
    }
    /**
     * Parse starting equipment from JSON string
     */
    parseStartingEquipment(characterClass) {
        return JSON.parse(characterClass.starting_equipment);
    }
    /**
     * Check if character class name exists
     */
    nameExists(name) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM character_classes WHERE name = ?');
        const result = stmt.get(name);
        return result.count > 0;
    }
}
exports.CharacterClassRepository = CharacterClassRepository;
