"use strict";
/**
 * Quest Template Repository
 * Database operations for quest templates (quest definitions)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestTemplateById = getQuestTemplateById;
exports.getAllQuestTemplates = getAllQuestTemplates;
exports.getQuestTemplatesByZone = getQuestTemplatesByZone;
exports.getQuestTemplatesByLevel = getQuestTemplatesByLevel;
exports.createQuestTemplate = createQuestTemplate;
exports.updateQuestTemplate = updateQuestTemplate;
exports.deleteQuestTemplate = deleteQuestTemplate;
const connection_1 = require("../connection");
/**
 * Get quest template by ID
 */
function getQuestTemplateById(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM quest_templates WHERE id = ?');
    const row = stmt.get(id);
    if (!row)
        return null;
    return {
        ...row,
        objectives: JSON.parse(row.objectives),
        rewards: JSON.parse(row.rewards)
    };
}
/**
 * Get all quest templates
 */
function getAllQuestTemplates() {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM quest_templates ORDER BY min_level ASC');
    const rows = stmt.all();
    return rows.map(row => ({
        ...row,
        objectives: JSON.parse(row.objectives),
        rewards: JSON.parse(row.rewards)
    }));
}
/**
 * Get quest templates by zone
 */
function getQuestTemplatesByZone(zoneId) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM quest_templates WHERE zone_id = ? ORDER BY min_level ASC');
    const rows = stmt.all(zoneId);
    return rows.map(row => ({
        ...row,
        objectives: JSON.parse(row.objectives),
        rewards: JSON.parse(row.rewards)
    }));
}
/**
 * Get quest templates by level range
 */
function getQuestTemplatesByLevel(level) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM quest_templates WHERE min_level <= ? AND (max_level IS NULL OR max_level >= ?) ORDER BY min_level ASC');
    const rows = stmt.all(level, level);
    return rows.map(row => ({
        ...row,
        objectives: JSON.parse(row.objectives),
        rewards: JSON.parse(row.rewards)
    }));
}
/**
 * Create quest template
 */
function createQuestTemplate(quest) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare(`
		INSERT INTO quest_templates (
			title, description, zone_id, min_level, max_level,
			objectives, rewards, is_repeatable, cooldown_hours, created_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
    const now = Math.floor(Date.now() / 1000);
    const result = stmt.run(quest.title, quest.description, quest.zone_id, quest.min_level, quest.max_level, JSON.stringify(quest.objectives), JSON.stringify(quest.rewards), quest.is_repeatable ? 1 : 0, quest.cooldown_hours, now);
    return {
        id: result.lastInsertRowid,
        ...quest,
        created_at: now
    };
}
/**
 * Update quest template
 */
function updateQuestTemplate(id, updates) {
    const db = (0, connection_1.getDatabase)();
    const fields = [];
    const values = [];
    if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.zone_id !== undefined) {
        fields.push('zone_id = ?');
        values.push(updates.zone_id);
    }
    if (updates.min_level !== undefined) {
        fields.push('min_level = ?');
        values.push(updates.min_level);
    }
    if (updates.max_level !== undefined) {
        fields.push('max_level = ?');
        values.push(updates.max_level);
    }
    if (updates.objectives !== undefined) {
        fields.push('objectives = ?');
        values.push(JSON.stringify(updates.objectives));
    }
    if (updates.rewards !== undefined) {
        fields.push('rewards = ?');
        values.push(JSON.stringify(updates.rewards));
    }
    if (updates.is_repeatable !== undefined) {
        fields.push('is_repeatable = ?');
        values.push(updates.is_repeatable ? 1 : 0);
    }
    if (updates.cooldown_hours !== undefined) {
        fields.push('cooldown_hours = ?');
        values.push(updates.cooldown_hours);
    }
    if (fields.length === 0)
        return false;
    values.push(id);
    const stmt = db.prepare(`UPDATE quest_templates SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
}
/**
 * Delete quest template
 */
function deleteQuestTemplate(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('DELETE FROM quest_templates WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
