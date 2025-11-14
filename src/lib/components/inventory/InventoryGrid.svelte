<script lang="ts">
	import { Card } from '$lib/components/ui/card';

	interface InventoryItem {
		id: number;
		itemTemplateId: number;
		name: string;
		description: string;
		type: string;
		rarity: string;
		quantity: number;
		equipped: boolean;
		iconPath: string | null;
	}

	interface Props {
		items: InventoryItem[];
		onItemClick?: (item: InventoryItem) => void;
		onEquip?: (itemId: number) => Promise<void>;
		onUnequip?: (itemId: number) => Promise<void>;
	}

	let { items, onItemClick, onEquip, onUnequip }: Props = $props();

	const getRarityColor = (rarity: string): string => {
		switch (rarity.toLowerCase()) {
			case 'common':
				return 'var(--color-gray-9)';
			case 'uncommon':
				return 'var(--color-green-9)';
			case 'rare':
				return 'var(--color-blue-9)';
			case 'epic':
				return 'var(--color-purple-9)';
			case 'legendary':
				return 'var(--color-yellow-9)';
			default:
				return 'var(--color-gray-9)';
		}
	};

	const handleEquipToggle = async (item: InventoryItem) => {
		if (item.equipped && onUnequip) {
			await onUnequip(item.id);
		} else if (!item.equipped && onEquip) {
			await onEquip(item.id);
		}
	};
</script>

<div class="inventory-grid-container">
	{#if items.length === 0}
		<Card variant="glass" class="empty-inventory">
			<p class="text-gray-11">Your inventory is empty</p>
		</Card>
	{:else}
		<div class="inventory-grid">
			{#each items as item}
				<Card
					variant="glass"
					class="inventory-item"
					onclick={() => onItemClick?.(item)}
					role="button"
					tabindex="0"
				>
					{#if item.equipped}
						<div class="equipped-badge">Equipped</div>
					{/if}

					<div class="item-icon" style="border-color: {getRarityColor(item.rarity)}">
						{#if item.iconPath}
							<img src={item.iconPath} alt={item.name} />
						{:else}
							<span class="item-placeholder">
								{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '📦'}
							</span>
						{/if}
					</div>

					<div class="item-info">
						<h4 class="item-name" style="color: {getRarityColor(item.rarity)}">
							{item.name}
						</h4>
						<p class="item-type">{item.type}</p>
						{#if item.quantity > 1}
							<span class="item-quantity">x{item.quantity}</span>
						{/if}
					</div>

					{#if onEquip || onUnequip}
						<button
							class="equip-button"
							onclick={(e) => {
								e.stopPropagation();
								handleEquipToggle(item);
							}}
						>
							{item.equipped ? 'Unequip' : 'Equip'}
						</button>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.inventory-grid-container {
		width: 100%;
	}

	.empty-inventory {
		padding: 4rem 2rem;
		text-align: center;
	}

	.inventory-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.inventory-item {
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.inventory-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}

	.equipped-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: var(--color-green-9);
		color: white;
		font-size: 0.625rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		text-transform: uppercase;
	}

	.item-icon {
		width: 100%;
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-gray-3);
		border: 2px solid;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.item-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-placeholder {
		font-size: 3rem;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.item-type {
		font-size: 0.75rem;
		color: var(--color-gray-11);
		text-transform: capitalize;
		margin: 0;
	}

	.item-quantity {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary-11);
	}

	.equip-button {
		width: 100%;
		padding: 0.5rem;
		background: var(--color-primary-4);
		border: 1px solid var(--color-primary-7);
		border-radius: 0.375rem;
		color: var(--color-primary-11);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.equip-button:hover {
		background: var(--color-primary-5);
		border-color: var(--color-primary-8);
	}
</style>
