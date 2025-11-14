<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CharacterCreation from '$lib/components/character/CharacterCreation.svelte';
	import QuestList from '$lib/components/quest/QuestList.svelte';
	import QuestDetails from '$lib/components/quest/QuestDetails.svelte';
	import InventoryGrid from '$lib/components/inventory/InventoryGrid.svelte';
	import NarrativeModal from '$lib/components/narrative/NarrativeModal.svelte';
	import type { QuestTemplate, ActiveQuest } from '$lib/stores/quest.svelte';
	import type { InventoryItem } from '$lib/stores/inventory.svelte';

	// Mock Data
	const mockClasses = [
		{
			id: 1,
			name: 'Warrior',
			description:
				'A mighty fighter skilled in close combat and heavy armor. High HP and strength make warriors perfect for frontline battles.'
		},
		{
			id: 2,
			name: 'Mage',
			description:
				'A master of arcane arts who wields devastating spells. High intelligence and magical power, but low physical defense.'
		},
		{
			id: 3,
			name: 'Rogue',
			description:
				'A swift and cunning fighter who strikes from the shadows. High dexterity enables critical hits and dodging attacks.'
		}
	];

	const mockAvailableQuests: QuestTemplate[] = [
		{
			id: 1,
			title: 'Welcome to the New World',
			description:
				'You have been transported to a mysterious new world. Explore your surroundings and learn the basics of survival.',
			minLevel: 1,
			maxLevel: null,
			objectives: [
				{
					type: 'explore',
					description: 'Explore the Starter Plains',
					target: 'starter_plains',
					required: 1
				},
				{
					type: 'kill',
					description: 'Defeat 3 Slimes',
					target: 'slime',
					required: 3
				}
			],
			rewards: {
				xp: 100,
				currency: 50,
				items: []
			},
			isRepeatable: false,
			cooldownHours: null
		},
		{
			id: 2,
			title: 'Gather Resources',
			description: 'Collect materials from the forest to help the village.',
			minLevel: 2,
			maxLevel: 5,
			objectives: [
				{
					type: 'collect',
					description: 'Gather 10 Wood',
					target: 'wood',
					required: 10
				}
			],
			rewards: {
				xp: 150,
				currency: 75,
				items: []
			},
			isRepeatable: true,
			cooldownHours: 24
		}
	];

	const mockActiveQuests: ActiveQuest[] = [
		{
			id: 1,
			questTemplateId: 1,
			status: 'in_progress',
			progress: [
				{
					type: 'explore',
					description: 'Explore the Starter Plains',
					target: 'starter_plains',
					required: 1,
					current: 1
				},
				{
					type: 'kill',
					description: 'Defeat 3 Slimes',
					target: 'slime',
					required: 3,
					current: 2
				}
			],
			startedAt: Math.floor(Date.now() / 1000) - 3600
		}
	];

	const mockInventoryItems: InventoryItem[] = [
		{
			id: 1,
			itemTemplateId: 1,
			name: 'Rusty Sword',
			description: 'A basic sword, worn but still functional.',
			type: 'weapon',
			rarity: 'common',
			quantity: 1,
			equipped: true,
			iconPath: null,
			stats: { damage: 5, strength: 2 }
		},
		{
			id: 2,
			itemTemplateId: 4,
			name: 'Leather Armor',
			description: 'Basic leather protection for adventurers.',
			type: 'armor',
			rarity: 'common',
			quantity: 1,
			equipped: true,
			iconPath: null,
			stats: { defense: 5, vitality: 2 }
		},
		{
			id: 3,
			itemTemplateId: 5,
			name: 'Health Potion',
			description: 'Restores 50 HP when consumed.',
			type: 'consumable',
			rarity: 'common',
			quantity: 5,
			equipped: false,
			iconPath: null,
			effects: { heal_hp: 50 }
		},
		{
			id: 4,
			itemTemplateId: 6,
			name: 'Magic Staff',
			description: 'A powerful staff imbued with arcane energy.',
			type: 'weapon',
			rarity: 'rare',
			quantity: 1,
			equipped: false,
			iconPath: null,
			stats: { damage: 12, intelligence: 5 }
		}
	];

	const isekaiNarrative = {
		title: 'A New Beginning',
		content: [
			"<p>You were walking home from work on a rainy evening when suddenly, <em>everything went white</em>.</p><p>When your vision clears, you find yourself standing in a lush meadow under an unfamiliar sky. The air is crisp, filled with the scent of wildflowers and something else—<strong>magic</strong>.</p>",
			"<p>A translucent window appears before your eyes, displaying <em>stats</em> and <em>abilities</em> as if you were in a game. Your heart races as you realize the impossible has happened.</p><p>You've been transported to <strong>another world</strong>.</p>",
			"<p>In the distance, you see a small village with smoke rising from chimneys. A path leads through the meadow toward civilization, toward <em>adventure</em>.</p><p>Your new life begins now. What will you become in this fantasy world?</p>"
		]
	};

	// State
	let currentView = $state<
		'intro' | 'character-creation' | 'quests' | 'inventory' | 'narrative'
	>('intro');
	let selectedQuest = $state<QuestTemplate | null>(null);
	let showNarrative = $state(false);

	// Handlers
	const handleCreateCharacter = async (name: string, classId: number) => {
		console.log('Creating character:', name, classId);
		alert(`Character "${name}" created successfully!`);
		currentView = 'narrative';
		showNarrative = true;
	};

	const handleAcceptQuest = async (questId: number) => {
		console.log('Accepting quest:', questId);
		alert('Quest accepted!');
	};

	const handleSelectQuest = (quest: QuestTemplate) => {
		selectedQuest = quest;
	};

	const handleCloseDetails = () => {
		selectedQuest = null;
	};

	const handleCompleteQuest = async (questId: number) => {
		console.log('Completing quest:', questId);
		alert('Quest completed! You gained 100 XP and 50 Gold!');
		selectedQuest = null;
	};

	const handleItemClick = (item: InventoryItem) => {
		console.log('Item clicked:', item);
		alert(`${item.name}\n\n${item.description}`);
	};

	const handleEquip = async (itemId: number) => {
		console.log('Equipping item:', itemId);
		alert('Item equipped!');
	};

	const handleUnequip = async (itemId: number) => {
		console.log('Unequipping item:', itemId);
		alert('Item unequipped!');
	};

	const handleCloseNarrative = () => {
		showNarrative = false;
		currentView = 'quests';
	};
</script>

<div class="demo-page">
	<div class="demo-header">
		<h1 class="demo-title">🎮 Fantasy RPG Demo</h1>
		<p class="demo-subtitle">Interactive component showcase with mock data</p>
	</div>

	{#if currentView === 'intro'}
		<Card variant="glass" class="intro-card">
			<h2 class="intro-title">Welcome to the Demo!</h2>
			<p class="intro-text">
				This demo showcases all the major UI components built for the Fantasy RPG game. All data
				is mocked - no authentication or database required.
			</p>
			<div class="intro-actions">
				<Button variant="primary" size="lg" onclick={() => (currentView = 'character-creation')}>
					Start Demo
				</Button>
				<Button variant="secondary" size="lg" onclick={() => (currentView = 'quests')}>
					View Quests
				</Button>
				<Button variant="secondary" size="lg" onclick={() => (currentView = 'inventory')}>
					View Inventory
				</Button>
				<Button
					variant="secondary"
					size="lg"
					onclick={() => {
						showNarrative = true;
						currentView = 'narrative';
					}}
				>
					View Narrative
				</Button>
			</div>
		</Card>
	{/if}

	{#if currentView === 'character-creation'}
		<div class="nav-back">
			<Button variant="secondary" size="sm" onclick={() => (currentView = 'intro')}>
				← Back to Menu
			</Button>
		</div>
		<CharacterCreation classes={mockClasses} onSubmit={handleCreateCharacter} />
	{/if}

	{#if currentView === 'quests'}
		<div class="nav-back">
			<Button variant="secondary" size="sm" onclick={() => (currentView = 'intro')}>
				← Back to Menu
			</Button>
		</div>
		<QuestList
			availableQuests={mockAvailableQuests}
			activeQuests={mockActiveQuests}
			onAcceptQuest={handleAcceptQuest}
			onSelectQuest={handleSelectQuest}
		/>

		{#if selectedQuest}
			{@const activeQuest = mockActiveQuests.find((q) => q.questTemplateId === selectedQuest.id) || null}
			<QuestDetails
				quest={selectedQuest}
				{activeQuest}
				onClose={handleCloseDetails}
				onComplete={handleCompleteQuest}
			/>
		{/if}
	{/if}

	{#if currentView === 'inventory'}
		<div class="demo-section">
			<div class="nav-back">
				<Button variant="secondary" size="sm" onclick={() => (currentView = 'intro')}>
					← Back to Menu
				</Button>
			</div>
			<Card variant="glass" class="inventory-container">
				<h2 class="section-title">Inventory</h2>
				<InventoryGrid
					items={mockInventoryItems}
					onItemClick={handleItemClick}
					onEquip={handleEquip}
					onUnequip={handleUnequip}
				/>
			</Card>
		</div>
	{/if}

	{#if showNarrative}
		<NarrativeModal
			title={isekaiNarrative.title}
			content={isekaiNarrative.content}
			onClose={handleCloseNarrative}
		/>
	{/if}
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: linear-gradient(to bottom, var(--color-primary-1), var(--color-primary-2));
		padding: 2rem;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.demo-title {
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 0.5rem;
	}

	.demo-subtitle {
		font-size: 1.25rem;
		color: var(--color-gray-11);
	}

	.intro-card {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem;
		text-align: center;
	}

	.intro-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 1.5rem;
	}

	.intro-text {
		font-size: 1.125rem;
		color: var(--color-gray-11);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.intro-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
		margin: 0 auto;
	}

	.nav-back {
		margin-bottom: 1.5rem;
	}

	.demo-section {
		max-width: 1200px;
		margin: 0 auto;
	}

	.inventory-container {
		padding: 2rem;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.demo-title {
			font-size: 2rem;
		}

		.demo-subtitle {
			font-size: 1rem;
		}

		.intro-card {
			padding: 2rem;
		}
	}
</style>
