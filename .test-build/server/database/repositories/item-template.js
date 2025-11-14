"use strict";
/**
 * Item Template Repository
 * Database operations for item templates (item definitions)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemTemplateById = getItemTemplateById;
exports.getAllItemTemplates = getAllItemTemplates;
exports.getItemTemplatesByType = getItemTemplatesByType;
exports.getItemTemplatesByRarity = getItemTemplatesByRarity;
exports.createItemTemplate = createItemTemplate;
exports.updateItemTemplate = updateItemTemplate;
exports.deleteItemTemplate = deleteItemTemplate;
const connection_1 = require("../connection");
/**
 * Get item template by ID
 */
function getItemTemplateById(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM item_templates WHERE id = ?');
    const row = stmt.get(id);
    if (!row)
        return null;
    return {
        ...row,
        stats: row.stats ? JSON.parse(row.stats) : null,
        effects: row.effects ? JSON.parse(row.effects) : null
    };
}
/**
 * Get all item templates
 */
function getAllItemTemplates() {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM item_templates ORDER BY level_requirement ASC, rarity ASC');
    const rows = stmt.all();
    return rows.map(row => ({
        ...row,
        stats: row.stats ? JSON.parse(row.stats) : null,
        effects: row.effects ? JSON.parse(row.effects) : null
    }));
}
/**
 * Get item templates by type
 */
function getItemTemplatesByType(type) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM item_templates WHERE type = ? ORDER BY level_requirement ASC');
    const rows = stmt.all(type);
    return rows.map(row => ({
        ...row,
        stats: row.stats ? JSON.parse(row.stats) : null,
        effects: row.effects ? JSON.parse(row.effects) : null
    }));
}
/**
 * Get item templates by rarity
 */
function getItemTemplatesByRarity(rarity) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM item_templates WHERE rarity = ? ORDER BY level_requirement ASC');
    const rows = stmt.all(rarity);
    return rows.map(row => ({
        ...row,
        stats: row.stats ? JSON.parse(row.stats) : null,
        effects: row.effects ? JSON.parse(row.effects) : null
    }));
}
/**
 * Create item template
 */
function createItemTemplate(item) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare(`
		INSERT INTO item_templates (
			name, description, type, rarity, level_requirement,
			stats, effects, max_stack, icon_path
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
    const result = stmt.run(item.name, item.description, item.type, item.rarity, item.level_requirement, item.stats ? JSON.stringify(item.stats) : null, item.effects ? JSON.stringify(item.effects) : null, item.max_stack, item.icon_path);
    return {
        id: result.lastInsertRowid,
        ...item
    };
}
/**
 * Update item template
 */
function updateItemTemplate(id, updates) {
    const db = (0, connection_1.getDatabase)();
    const fields = [];
    const values = [];
    if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.type !== undefined) {
        fields.push('type = ?');
        values.push(updates.type);
    }
    if (updates.rarity !== undefined) {
        fields.push('rarity = ?');
        values.push(updates.rarity);
    }
    if (updates.level_requirement !== undefined) {
        fields.push('level_requirement = ?');
        values.push(updates.level_requirement);
    }
    if (updates.stats !== undefined) {
        fields.push('stats = ?');
        values.push(updates.stats ? JSON.stringify(updates.stats) : null);
    }
    if (updates.effects !== undefined) {
        fields.push('effects = ?');
        values.push(updates.effects ? JSON.stringify(updates.effects) : null);
    }
    if (updates.max_stack !== undefined) {
        fields.push('max_stack = ?');
        values.push(updates.max_stack);
    }
    if (updates.icon_path !== undefined) {
        fields.push('icon_path = ?');
        values.push(updates.icon_path);
    }
    if (fields.length === 0)
        return false;
    values.push(id);
    const stmt = db.prepare(`UPDATE item_templates SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
}
/**
 * Delete item template
 */
function deleteItemTemplate(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('DELETE FROM item_templates WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
