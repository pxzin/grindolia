/**
 * Inventory Item Repository
 * Database operations for character inventory items
 */

import { getDatabase } from '../connection';

export interface InventoryItem {
	id: number;
	character_id: number;
	item_template_id: number;
	quantity: number;
	equipped: boolean;
	acquired_at: number;
}

/**
 * Get inventory item by ID
 */
export function getInventoryItemById(id: number): InventoryItem | null {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM inventory_items WHERE id = ?');
	const row = stmt.get(id) as InventoryItem | null;

	if (!row) return null;

	return {
		...row,
		equipped: Boolean(row.equipped)
	};
}

/**
 * Get all inventory items for a character
 */
export function getCharacterInventory(characterId: number): InventoryItem[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? ORDER BY acquired_at DESC');
	const rows = stmt.all(characterId) as InventoryItem[];

	return rows.map(row => ({
		...row,
		equipped: Boolean(row.equipped)
	}));
}

/**
 * Get equipped items for a character
 */
export function getEquippedItems(characterId: number): InventoryItem[] {
	const db = getDatabase();
	const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND equipped = 1');
	const rows = stmt.all(characterId) as InventoryItem[];

	return rows.map(row => ({
		...row,
		equipped: true
	}));
}

/**
 * Check if character has item
 */
export function hasItem(characterId: number, itemTemplateId: number, requiredQuantity: number = 1): boolean {
	const db = getDatabase();
	const stmt = db.prepare('SELECT SUM(quantity) as total FROM inventory_items WHERE character_id = ? AND item_template_id = ?');
	const result = stmt.get(characterId, itemTemplateId) as { total: number | null };
	return (result.total || 0) >= requiredQuantity;
}

/**
 * Get item quantity
 */
export function getItemQuantity(characterId: number, itemTemplateId: number): number {
	const db = getDatabase();
	const stmt = db.prepare('SELECT SUM(quantity) as total FROM inventory_items WHERE character_id = ? AND item_template_id = ?');
	const result = stmt.get(characterId, itemTemplateId) as { total: number | null };
	return result.total || 0;
}

/**
 * Add item to inventory
 */
export function addItem(characterId: number, itemTemplateId: number, quantity: number): InventoryItem {
	const db = getDatabase();

	// Check if item exists and can stack
	const existingStmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND item_template_id = ? AND equipped = 0 LIMIT 1');
	const existing = existingStmt.get(characterId, itemTemplateId) as InventoryItem | null;

	if (existing) {
		// Update existing stack
		const updateStmt = db.prepare('UPDATE inventory_items SET quantity = quantity + ? WHERE id = ?');
		updateStmt.run(quantity, existing.id);

		return {
			...existing,
			quantity: existing.quantity + quantity,
			equipped: false
		};
	} else {
		// Create new stack
		const insertStmt = db.prepare(`
			INSERT INTO inventory_items (character_id, item_template_id, quantity, equipped, acquired_at)
			VALUES (?, ?, ?, 0, ?)
		`);

		const now = Math.floor(Date.now() / 1000);
		const result = insertStmt.run(characterId, itemTemplateId, quantity, now);

		return {
			id: result.lastInsertRowid as number,
			character_id: characterId,
			item_template_id: itemTemplateId,
			quantity,
			equipped: false,
			acquired_at: now
		};
	}
}

/**
 * Remove item from inventory
 */
export function removeItem(characterId: number, itemTemplateId: number, quantity: number): boolean {
	const db = getDatabase();

	// Get all stacks of this item
	const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND item_template_id = ? AND equipped = 0 ORDER BY acquired_at ASC');
	const stacks = stmt.all(characterId, itemTemplateId) as InventoryItem[];

	let remaining = quantity;

	for (const stack of stacks) {
		if (remaining <= 0) break;

		if (stack.quantity <= remaining) {
			// Remove entire stack
			const deleteStmt = db.prepare('DELETE FROM inventory_items WHERE id = ?');
			deleteStmt.run(stack.id);
			remaining -= stack.quantity;
		} else {
			// Reduce stack quantity
			const updateStmt = db.prepare('UPDATE inventory_items SET quantity = quantity - ? WHERE id = ?');
			updateStmt.run(remaining, stack.id);
			remaining = 0;
		}
	}

	return remaining === 0;
}

/**
 * Equip item
 */
export function equipItem(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('UPDATE inventory_items SET equipped = 1 WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}

/**
 * Unequip item
 */
export function unequipItem(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('UPDATE inventory_items SET equipped = 0 WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}

/**
 * Delete inventory item
 */
export function deleteInventoryItem(id: number): boolean {
	const db = getDatabase();
	const stmt = db.prepare('DELETE FROM inventory_items WHERE id = ?');
	const result = stmt.run(id);
	return result.changes > 0;
}

/**
 * Get inventory size (total items)
 */
export function getInventorySize(characterId: number): number {
	const db = getDatabase();
	const stmt = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE character_id = ?');
	const result = stmt.get(characterId) as { count: number };
	return result.count;
}
