"use strict";
/**
 * Inventory Item Repository
 * Database operations for character inventory items
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItemRepository = void 0;
exports.getInventoryItemById = getInventoryItemById;
exports.getCharacterInventory = getCharacterInventory;
exports.getEquippedItems = getEquippedItems;
exports.hasItem = hasItem;
exports.getItemQuantity = getItemQuantity;
exports.addItem = addItem;
exports.removeItem = removeItem;
exports.equipItem = equipItem;
exports.unequipItem = unequipItem;
exports.deleteInventoryItem = deleteInventoryItem;
exports.getInventorySize = getInventorySize;
const connection_1 = require("../connection");
class InventoryItemRepository {
    constructor(database) {
        this.db = database || (0, connection_1.getDatabase)();
    }
    /**
     * Create inventory item
     */
    create(data) {
        const now = Math.floor(Date.now() / 1000);
        const stmt = this.db.prepare(`
			INSERT INTO inventory_items (character_id, item_template_id, quantity, equipped, acquired_at)
			VALUES (?, ?, ?, ?, ?)
		`);
        const result = stmt.run(data.character_id, data.item_template_id, data.quantity, data.equipped ? 1 : 0, now);
        return {
            id: result.lastInsertRowid,
            character_id: data.character_id,
            item_template_id: data.item_template_id,
            quantity: data.quantity,
            equipped: data.equipped,
            acquired_at: now
        };
    }
    /**
     * Find inventory item by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM inventory_items WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return {
            ...row,
            equipped: Boolean(row.equipped)
        };
    }
    /**
     * Find all items for a character
     */
    findByCharacter(characterId) {
        const stmt = this.db.prepare('SELECT * FROM inventory_items WHERE character_id = ? ORDER BY acquired_at DESC');
        const rows = stmt.all(characterId);
        return rows.map(row => ({
            ...row,
            equipped: Boolean(row.equipped)
        }));
    }
}
exports.InventoryItemRepository = InventoryItemRepository;
/**
 * Get inventory item by ID
 */
function getInventoryItemById(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM inventory_items WHERE id = ?');
    const row = stmt.get(id);
    if (!row)
        return null;
    return {
        ...row,
        equipped: Boolean(row.equipped)
    };
}
/**
 * Get all inventory items for a character
 */
function getCharacterInventory(characterId) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? ORDER BY acquired_at DESC');
    const rows = stmt.all(characterId);
    return rows.map(row => ({
        ...row,
        equipped: Boolean(row.equipped)
    }));
}
/**
 * Get equipped items for a character
 */
function getEquippedItems(characterId) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND equipped = 1');
    const rows = stmt.all(characterId);
    return rows.map(row => ({
        ...row,
        equipped: true
    }));
}
/**
 * Check if character has item
 */
function hasItem(characterId, itemTemplateId, requiredQuantity = 1) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT SUM(quantity) as total FROM inventory_items WHERE character_id = ? AND item_template_id = ?');
    const result = stmt.get(characterId, itemTemplateId);
    return (result.total || 0) >= requiredQuantity;
}
/**
 * Get item quantity
 */
function getItemQuantity(characterId, itemTemplateId) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT SUM(quantity) as total FROM inventory_items WHERE character_id = ? AND item_template_id = ?');
    const result = stmt.get(characterId, itemTemplateId);
    return result.total || 0;
}
/**
 * Add item to inventory
 */
function addItem(characterId, itemTemplateId, quantity) {
    const db = (0, connection_1.getDatabase)();
    // Check if item exists and can stack
    const existingStmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND item_template_id = ? AND equipped = 0 LIMIT 1');
    const existing = existingStmt.get(characterId, itemTemplateId);
    if (existing) {
        // Update existing stack
        const updateStmt = db.prepare('UPDATE inventory_items SET quantity = quantity + ? WHERE id = ?');
        updateStmt.run(quantity, existing.id);
        return {
            ...existing,
            quantity: existing.quantity + quantity,
            equipped: false
        };
    }
    else {
        // Create new stack
        const insertStmt = db.prepare(`
			INSERT INTO inventory_items (character_id, item_template_id, quantity, equipped, acquired_at)
			VALUES (?, ?, ?, 0, ?)
		`);
        const now = Math.floor(Date.now() / 1000);
        const result = insertStmt.run(characterId, itemTemplateId, quantity, now);
        return {
            id: result.lastInsertRowid,
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
function removeItem(characterId, itemTemplateId, quantity) {
    const db = (0, connection_1.getDatabase)();
    // Get all stacks of this item
    const stmt = db.prepare('SELECT * FROM inventory_items WHERE character_id = ? AND item_template_id = ? AND equipped = 0 ORDER BY acquired_at ASC');
    const stacks = stmt.all(characterId, itemTemplateId);
    let remaining = quantity;
    for (const stack of stacks) {
        if (remaining <= 0)
            break;
        if (stack.quantity <= remaining) {
            // Remove entire stack
            const deleteStmt = db.prepare('DELETE FROM inventory_items WHERE id = ?');
            deleteStmt.run(stack.id);
            remaining -= stack.quantity;
        }
        else {
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
function equipItem(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('UPDATE inventory_items SET equipped = 1 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
/**
 * Unequip item
 */
function unequipItem(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('UPDATE inventory_items SET equipped = 0 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
/**
 * Delete inventory item
 */
function deleteInventoryItem(id) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('DELETE FROM inventory_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
/**
 * Get inventory size (total items)
 */
function getInventorySize(characterId) {
    const db = (0, connection_1.getDatabase)();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM inventory_items WHERE character_id = ?');
    const result = stmt.get(characterId);
    return result.count;
}
