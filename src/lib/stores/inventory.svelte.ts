/**
 * Inventory Store
 * Manages inventory state using Svelte 5 runes
 */

export interface InventoryItem {
	id: number;
	itemTemplateId: number;
	name: string;
	description: string;
	type: string;
	rarity: string;
	quantity: number;
	equipped: boolean;
	iconPath: string | null;
	stats?: Record<string, number> | null;
	effects?: Record<string, number> | null;
}

class InventoryStore {
	private _items = $state<InventoryItem[]>([]);
	private _selectedItem = $state<InventoryItem | null>(null);

	/**
	 * Get all inventory items (readonly)
	 */
	get items(): Readonly<InventoryItem[]> {
		return this._items;
	}

	/**
	 * Get selected item (readonly)
	 */
	get selectedItem(): Readonly<InventoryItem> | null {
		return this._selectedItem;
	}

	/**
	 * Get equipped items
	 */
	get equippedItems(): Readonly<InventoryItem[]> {
		return this._items.filter((item) => item.equipped);
	}

	/**
	 * Get items by type
	 */
	getItemsByType(type: string): InventoryItem[] {
		return this._items.filter((item) => item.type === type);
	}

	/**
	 * Get item by ID
	 */
	getItemById(id: number): InventoryItem | undefined {
		return this._items.find((item) => item.id === id);
	}

	/**
	 * Check if item is equipped
	 */
	isEquipped(itemId: number): boolean {
		const item = this.getItemById(itemId);
		return item?.equipped || false;
	}

	/**
	 * Get total inventory size
	 */
	get totalItems(): number {
		return this._items.reduce((sum, item) => sum + item.quantity, 0);
	}

	/**
	 * Set inventory items
	 */
	setItems(items: InventoryItem[]): void {
		this._items = items;
	}

	/**
	 * Add item to inventory
	 */
	addItem(item: InventoryItem): void {
		// Check if item already exists (for stackable items)
		const existingItem = this._items.find(
			(i) => i.itemTemplateId === item.itemTemplateId && !i.equipped
		);

		if (existingItem) {
			existingItem.quantity += item.quantity;
			// Force reactivity
			this._items = [...this._items];
		} else {
			this._items = [...this._items, item];
		}
	}

	/**
	 * Remove item from inventory
	 */
	removeItem(itemId: number, quantity: number = 1): void {
		const itemIndex = this._items.findIndex((i) => i.id === itemId);

		if (itemIndex >= 0) {
			const item = this._items[itemIndex];

			if (item.quantity > quantity) {
				item.quantity -= quantity;
				// Force reactivity
				this._items = [...this._items];
			} else {
				this._items = this._items.filter((i) => i.id !== itemId);
			}
		}
	}

	/**
	 * Update item
	 */
	updateItem(itemId: number, updates: Partial<InventoryItem>): void {
		const itemIndex = this._items.findIndex((i) => i.id === itemId);

		if (itemIndex >= 0) {
			this._items[itemIndex] = { ...this._items[itemIndex], ...updates };
			// Force reactivity
			this._items = [...this._items];
		}
	}

	/**
	 * Equip item
	 */
	equipItem(itemId: number): void {
		this.updateItem(itemId, { equipped: true });
	}

	/**
	 * Unequip item
	 */
	unequipItem(itemId: number): void {
		this.updateItem(itemId, { equipped: false });
	}

	/**
	 * Select item for details view
	 */
	selectItem(item: InventoryItem | null): void {
		this._selectedItem = item;
	}

	/**
	 * Sort items
	 */
	sortBy(key: keyof InventoryItem, ascending: boolean = true): void {
		this._items = [...this._items].sort((a, b) => {
			const aVal = a[key];
			const bVal = b[key];

			if (aVal < bVal) return ascending ? -1 : 1;
			if (aVal > bVal) return ascending ? 1 : -1;
			return 0;
		});
	}

	/**
	 * Filter items
	 */
	filterByRarity(rarity: string): InventoryItem[] {
		return this._items.filter((item) => item.rarity === rarity);
	}

	/**
	 * Reset store
	 */
	reset(): void {
		this._items = [];
		this._selectedItem = null;
	}
}

// Export singleton instance
export const inventoryStore = new InventoryStore();
