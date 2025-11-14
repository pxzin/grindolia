/**
 * Item Template Repository
 * Database operations for item templates (item definitions)
 */

import { getDatabase } from '../connection';
import type { ItemType, ItemRarity, ItemStats, ItemEffects } from '$lib/types/item';

export interface ItemTemplate {
	id: number;
	name: string;
	description: string;
	type: ItemType;
	rarity: ItemRarity;
	level_requirement: number;
	stats: ItemStats | null;
	effects: ItemEffects | null;
	max_stack: number;
	icon_path: string | null;
}

/**
 * Get item template by ID
 */
export function getItemTemplateById(id: number): ItemTemplate | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM item_templates WHERE id = ?');
	const row = stmt.get(id) as Omit<ItemTemplate, 'stats' | 'effects'> & { stats: string | null; effects: string | null } | null;

	if (!row) return null;

	return {
		...row,
		stats: row.stats ? (JSON.parse(row.stats) as ItemStats) : null,
		effects: row.effects ? (JSON.parse(row.effects) as ItemEffects) : null
	};
}

/**
 * Get all item templates
 */
export function getAllItemTemplates(): ItemTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM item_templates ORDER BY level_requirement ASC, rarity ASC');
	const rows = stmt.all() as Array<Omit<ItemTemplate, 'stats' | 'effects'> & { stats: string | null; effects: string | null }>;

	return rows.map(row => ({
		...row,
		stats: row.stats ? (JSON.parse(row.stats) as ItemStats) : null,
		effects: row.effects ? (JSON.parse(row.effects) as ItemEffects) : null
	}));
}

/**
 * Get item templates by type
 */
export function getItemTemplatesByType(type: ItemType): ItemTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM item_templates WHERE type = ? ORDER BY level_requirement ASC');
	const rows = stmt.all(type) as Array<Omit<ItemTemplate, 'stats' | 'effects'> & { stats: string | null; effects: string | null }>;

	return rows.map(row => ({
		...row,
		stats: row.stats ? (JSON.parse(row.stats) as ItemStats) : null,
		effects: row.effects ? (JSON.parse(row.effects) as ItemEffects) : null
	}));
}

/**
 * Get item templates by rarity
 */
export function getItemTemplatesByRarity(rarity: ItemRarity): ItemTemplate[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM item_templates WHERE rarity = ? ORDER BY level_requirement ASC');
	const rows = stmt.all(rarity) as Array<Omit<ItemTemplate, 'stats' | 'effects'> & { stats: string | null; effects: string | null }>;

	return rows.map(row => ({
		...row,
		stats: row.stats ? (JSON.parse(row.stats) as ItemStats) : null,
		effects: row.effects ? (JSON.parse(row.effects) as ItemEffects) : null
	}));
}

/**
 * Create item template
 */
export function createItemTemplate(item: Omit<ItemTemplate, 'id'>): ItemTemplate {
	const db = getDatabase();
	const stmt = db.prepare(`
		INSERT INTO item_templates (
			name, description, type, rarity, level_requirement,
			stats, effects, max_stack, icon_path
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

	const result = stmt.run(
		item.name,
		item.description,
		item.type,
		item.rarity,
		item.level_requirement,
		item.stats ? JSON.stringify(item.stats) : null,
		item.effects ? JSON.stringify(item.effects) : null,
		item.max_stack,
		item.icon_path
	);

	return {
		id: result.lastInsertRowid as number,
		...item
	};
}

/**
 * Update item template
 */
export function updateItemTemplate(
	id: number,
	updates: Partial<Omit<ItemTemplate, 'id'>>
): boolean {
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

	if (fields.length === 0) return false;

	values.push(id);
	const stmt = db.prepare(`UPDATE item_templates SET ${fields.join(', ')} WHERE id = ?`);
	const result = stmt.run(...values);
	return result.changes > 0;
}

/**
 * Delete item template
 */
export function deleteItemTemplate(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('DELETE FROM item_templates WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}
