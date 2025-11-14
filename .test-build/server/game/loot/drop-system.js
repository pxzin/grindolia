"use strict";
/**
 * Loot Drop System
 * Handles item drops, currency rewards, and loot table resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollLootItem = rollLootItem;
exports.processLootTable = processLootTable;
exports.rollMonsterLoot = rollMonsterLoot;
exports.rollFloorLoot = rollFloorLoot;
exports.applyRarityBonus = applyRarityBonus;
exports.mergeLootDrops = mergeLootDrops;
/**
 * Roll for a single loot item
 */
function rollLootItem(entry) {
    const roll = Math.random();
    if (roll < entry.drop_chance) {
        const quantity = entry.min_quantity + Math.floor(Math.random() * (entry.max_quantity - entry.min_quantity + 1));
        return {
            item_template_id: entry.item_template_id,
            quantity
        };
    }
    return null;
}
/**
 * Process a complete loot table
 */
function processLootTable(lootTable) {
    const items = [];
    // Roll for each item in the loot table
    for (const entry of lootTable.items) {
        const drop = rollLootItem(entry);
        if (drop) {
            items.push(drop);
        }
    }
    // Calculate currency reward
    const currency = lootTable.currency_min && lootTable.currency_max
        ? lootTable.currency_min + Math.floor(Math.random() * (lootTable.currency_max - lootTable.currency_min + 1))
        : 0;
    return { items, currency };
}
/**
 * Roll monster loot drops
 */
function rollMonsterLoot(monsterLootTable) {
    if (!monsterLootTable) {
        return { items: [], currency: 0 };
    }
    // Parse if JSON string
    const lootTable = typeof monsterLootTable === 'string'
        ? JSON.parse(monsterLootTable)
        : monsterLootTable;
    return processLootTable(lootTable);
}
/**
 * Roll floor completion loot
 */
function rollFloorLoot(floorLootTable) {
    const lootTable = JSON.parse(floorLootTable);
    return processLootTable(lootTable);
}
/**
 * Apply rarity multiplier to drop chances
 */
function applyRarityBonus(lootTable, rarityMultiplier) {
    return {
        ...lootTable,
        items: lootTable.items.map(entry => ({
            ...entry,
            drop_chance: Math.min(1, entry.drop_chance * rarityMultiplier)
        }))
    };
}
/**
 * Merge multiple loot drops
 */
function mergeLootDrops(drops) {
    const itemMap = new Map();
    let totalCurrency = 0;
    for (const drop of drops) {
        // Merge items
        for (const item of drop.items) {
            const existing = itemMap.get(item.item_template_id) || 0;
            itemMap.set(item.item_template_id, existing + item.quantity);
        }
        // Sum currency
        totalCurrency += drop.currency;
    }
    const items = Array.from(itemMap.entries()).map(([item_template_id, quantity]) => ({
        item_template_id,
        quantity
    }));
    return { items, currency: totalCurrency };
}
