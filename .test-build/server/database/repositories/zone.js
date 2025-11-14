"use strict";
/**
 * Zone Repository
 * Database operations for game zones/areas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZoneById = getZoneById;
exports.getAllZones = getAllZones;
exports.getZonesByLevel = getZonesByLevel;
exports.createZone = createZone;
exports.updateZone = updateZone;
exports.deleteZone = deleteZone;
const connection_1 = require("../connection");
/**
 * Get zone by ID
 */
function getZoneById(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM zones WHERE id = ?');
    return stmt.get(id);
}
/**
 * Get all zones
 */
function getAllZones() {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM zones ORDER BY min_level ASC');
    return stmt.all();
}
/**
 * Get zones by level range
 */
function getZonesByLevel(level) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM zones WHERE min_level <= ? AND max_level >= ? ORDER BY min_level ASC');
    return stmt.all(level, level);
}
/**
 * Create zone
 */
function createZone(zone) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare(`
		INSERT INTO zones (name, description, min_level, max_level, theme, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`);
    const now = Math.floor(Date.now() / 1000);
    const result = stmt.run(zone.name, zone.description, zone.min_level, zone.max_level, zone.theme, now);
    return {
        id: result.lastInsertRowid,
        ...zone,
        created_at: now
    };
}
/**
 * Update zone
 */
function updateZone(id, updates) {
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
    if (updates.min_level !== undefined) {
        fields.push('min_level = ?');
        values.push(updates.min_level);
    }
    if (updates.max_level !== undefined) {
        fields.push('max_level = ?');
        values.push(updates.max_level);
    }
    if (updates.theme !== undefined) {
        fields.push('theme = ?');
        values.push(updates.theme);
    }
    if (fields.length === 0)
        return false;
    values.push(id);
    const stmt = db.prepare(`UPDATE zones SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
}
/**
 * Delete zone
 */
function deleteZone(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('DELETE FROM zones WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
