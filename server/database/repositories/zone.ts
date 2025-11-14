/**
 * Zone Repository
 * Database operations for game zones/areas
 */

import { getDatabase } from '../connection';
import type { Database } from 'better-sqlite3';

export interface Zone {
	id: number;
	name: string;
	description: string;
	min_level: number;
	max_level: number;
	theme: string;
	created_at: number;
}

/**
 * Get zone by ID
 */
export function getZoneById(id: number): Zone | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM zones WHERE id = ?');
	return stmt.get(id) as Zone | null;
}

/**
 * Get all zones
 */
export function getAllZones(): Zone[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM zones ORDER BY min_level ASC');
	return stmt.all() as Zone[];
}

/**
 * Get zones by level range
 */
export function getZonesByLevel(level: number): Zone[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM zones WHERE min_level <= ? AND max_level >= ? ORDER BY min_level ASC');
	return stmt.all(level, level) as Zone[];
}

/**
 * Create zone
 */
export function createZone(zone: Omit<Zone, 'id' | 'created_at'>): Zone {
	const db = getDatabase();
	const stmt = db.prepare(`
		INSERT INTO zones (name, description, min_level, max_level, theme, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`);

	const now = Math.floor(Date.now() / 1000);
	const result = stmt.run(zone.name, zone.description, zone.min_level, zone.max_level, zone.theme, now);

	return {
		id: result.lastInsertRowid as number,
		...zone,
		created_at: now
	};
}

/**
 * Update zone
 */
export function updateZone(id: number, updates: Partial<Omit<Zone, 'id' | 'created_at'>>): boolean {
	const db = getDatabase();
	const fields: string[] = [];
	const values: unknown[] = [];

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

	if (fields.length === 0) return false;

	values.push(id);
	const stmt = db.prepare(`UPDATE zones SET ${fields.join(', ')} WHERE id = ?`);
	const result = stmt.run(...values);
	return result.changes > 0;
}

/**
 * Delete zone
 */
export function deleteZone(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('DELETE FROM zones WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}
