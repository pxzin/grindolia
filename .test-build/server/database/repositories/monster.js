"use strict";
/**
 * Monster Repository
 * Data access layer for monster operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonsterRepository = void 0;
const connection_1 = require("../connection");
class MonsterRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Find monster by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM monsters WHERE id = ?');
        return stmt.get(id) || null;
    }
    /**
     * Find monster by name
     */
    findByName(name) {
        const stmt = this.db.prepare('SELECT * FROM monsters WHERE name = ?');
        return stmt.get(name) || null;
    }
    /**
     * Find all monsters
     */
    findAll() {
        const stmt = this.db.prepare('SELECT * FROM monsters ORDER BY base_level ASC, name ASC');
        return stmt.all();
    }
    /**
     * Find monsters by type
     */
    findByType(monsterType) {
        const stmt = this.db.prepare('SELECT * FROM monsters WHERE monster_type = ? ORDER BY base_level ASC');
        return stmt.all(monsterType);
    }
    /**
     * Find monsters by level range
     */
    findByLevelRange(minLevel, maxLevel) {
        const stmt = this.db.prepare('SELECT * FROM monsters WHERE base_level BETWEEN ? AND ? ORDER BY base_level ASC');
        return stmt.all(minLevel, maxLevel);
    }
    /**
     * Find monsters by exact level
     */
    findByLevel(level) {
        const stmt = this.db.prepare('SELECT * FROM monsters WHERE base_level = ? ORDER BY name ASC');
        return stmt.all(level);
    }
    /**
     * Create a new monster
     */
    create(data) {
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
        const monster = this.findById(result.lastInsertRowid);
        if (!monster) {
            throw new Error('Failed to create monster');
        }
        return monster;
    }
    /**
     * Update monster data
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
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM monsters WHERE id = ?');
        stmt.run(id);
    }
    /**
     * Parse loot table from JSON string
     */
    parseLootTable(monster) {
        if (!monster.loot_table) {
            return null;
        }
        return JSON.parse(monster.loot_table);
    }
    /**
     * Calculate scaled stats for a monster at a specific level
     */
    calculateScaledStats(monster, level, difficultyMultiplier = 1.0) {
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
exports.MonsterRepository = MonsterRepository;
