/**
 * Item Types
 * Type definitions for item-related data structures
 */

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

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
	strength?: number;
	intelligence?: number;
	dexterity?: number;
	vitality?: number;
	hp?: number;
	damage?: number;
	defense?: number;
	[key: string]: number | undefined;
}

export interface ItemEffects {
	heal_hp?: number;
	heal_percent?: number;
	buff_duration?: number;
	buff_stat?: string;
	buff_amount?: number;
	[key: string]: number | string | undefined;
}

export interface InventoryItem {
	id: number;
	character_id: number;
	item_template_id: number;
	quantity: number;
	equipped: boolean;
	acquired_at: number;
}

export interface InventoryItemWithTemplate {
	inventory_item: InventoryItem;
	template: ItemTemplate;
}

export interface EquipItemRequest {
	character_id: number;
	inventory_item_id: number;
}

export interface UnequipItemRequest {
	character_id: number;
	inventory_item_id: number;
}

export interface UseItemRequest {
	character_id: number;
	inventory_item_id: number;
	quantity?: number;
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: ItemRarity): string {
	const colors: Record<ItemRarity, string> = {
		common: 'text-gray-11',
		uncommon: 'text-green-11',
		rare: 'text-blue-11',
		epic: 'text-purple-11',
		legendary: 'text-amber-11'
	};
	return colors[rarity];
}

/**
 * Get rarity display name
 */
export function getRarityName(rarity: ItemRarity): string {
	return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Get item type display name
 */
export function getItemTypeName(type: ItemType): string {
	const names: Record<ItemType, string> = {
		weapon: 'Weapon',
		armor: 'Armor',
		accessory: 'Accessory',
		consumable: 'Consumable',
		material: 'Material'
	};
	return names[type];
}

/**
 * Check if item can be equipped
 */
export function canEquip(item: ItemTemplate): boolean {
	return ['weapon', 'armor', 'accessory'].includes(item.type);
}

/**
 * Check if item is consumable
 */
export function isConsumable(item: ItemTemplate): boolean {
	return item.type === 'consumable';
}

/**
 * Calculate total stat bonus from equipped items
 */
export function calculateEquipmentStats(items: InventoryItemWithTemplate[]): ItemStats {
	const totalStats: ItemStats = {};

	items
		.filter((item) => item.inventory_item.equipped && item.template.stats)
		.forEach((item) => {
			if (item.template.stats) {
				Object.entries(item.template.stats).forEach(([stat, value]) => {
					if (value !== undefined) {
						totalStats[stat] = (totalStats[stat] || 0) + value;
					}
				});
			}
		});

	return totalStats;
}
