/**
 * Loot Drop System
 * Handles item drops, currency rewards, and loot table resolution
 */

export interface LootTableEntry {
	item_template_id: number;
	drop_chance: number;
	min_quantity: number;
	max_quantity: number;
	rarity?: string;
}

export interface LootTable {
	items: LootTableEntry[];
	currency_min?: number;
	currency_max?: number;
}

export interface LootDrop {
	items: Array<{ item_template_id: number; quantity: number }>;
	currency: number;
}

/**
 * Roll for a single loot item
 */
export function rollLootItem(entry: LootTableEntry): { item_template_id: number; quantity: number } | null {
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
export function processLootTable(lootTable: LootTable): LootDrop {
	const items: Array<{ item_template_id: number; quantity: number }> = [];

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
export function rollMonsterLoot(monsterLootTable: LootTable | string | null): LootDrop {
	if (!monsterLootTable) {
		return { items: [], currency: 0 };
	}

	// Parse if JSON string
	const lootTable = typeof monsterLootTable === 'string'
		? JSON.parse(monsterLootTable) as LootTable
		: monsterLootTable;

	return processLootTable(lootTable);
}

/**
 * Roll floor completion loot
 */
export function rollFloorLoot(floorLootTable: string): LootDrop {
	const lootTable = JSON.parse(floorLootTable) as LootTable;
	return processLootTable(lootTable);
}

/**
 * Apply rarity multiplier to drop chances
 */
export function applyRarityBonus(
	lootTable: LootTable,
	rarityMultiplier: number
): LootTable {
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
export function mergeLootDrops(drops: LootDrop[]): LootDrop {
	const itemMap = new Map<number, number>();
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
