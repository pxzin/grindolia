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
		'intro' | 'character-creation' | 'quests' | 'inventory' | 'narrative' | 'api-test'
	>('intro');
	let selectedQuest = $state<QuestTemplate | null>(null);
	let showNarrative = $state(false);

	// API Testing state
	let registerEmail = $state('');
	let registerUsername = $state('');
	let registerPassword = $state('');
	let loginEmail = $state('');
	let loginPassword = $state('');
	let characterName = $state('');
	let characterClassId = $state(1);
	let apiResponse = $state('');
	let isLoggedIn = $state(false);
	let currentUser = $state<any>(null);

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

	// API Testing handlers
	const handleRegister = async () => {
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: registerEmail,
					username: registerUsername,
					password: registerPassword
				})
			});

			const data = await response.json();
			if (response.ok) {
				apiResponse = `✅ Registration successful!\n${JSON.stringify(data, null, 2)}`;
			} else {
				apiResponse = `❌ Registration failed:\n${JSON.stringify(data, null, 2)}`;
			}
		} catch (error) {
			apiResponse = `❌ Error: ${error}`;
		}
	};

	const handleLogin = async () => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: loginEmail,
					password: loginPassword
				})
			});

			const data = await response.json();
			if (response.ok) {
				isLoggedIn = true;
				currentUser = data.player;
				apiResponse = `✅ Login successful!\n${JSON.stringify(data, null, 2)}`;
			} else {
				apiResponse = `❌ Login failed:\n${JSON.stringify(data, null, 2)}`;
			}
		} catch (error) {
			apiResponse = `❌ Error: ${error}`;
		}
	};

	const handleCreateCharacterAPI = async () => {
		try {
			const response = await fetch('/api/character', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: characterName,
					classId: characterClassId
				})
			});

			const data = await response.json();
			if (response.ok) {
				apiResponse = `✅ Character created!\n${JSON.stringify(data, null, 2)}`;
			} else {
				apiResponse = `❌ Character creation failed:\n${JSON.stringify(data, null, 2)}`;
			}
		} catch (error) {
			apiResponse = `❌ Error: ${error}`;
		}
	};

	const handleLogout = () => {
		isLoggedIn = false;
		currentUser = null;
		apiResponse = '✅ Logged out';
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
				<Button variant="primary" size="lg" onclick={() => (currentView = 'api-test')}>
					🔌 Test Backend APIs
				</Button>
				<Button variant="secondary" size="lg" onclick={() => (currentView = 'character-creation')}>
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

	{#if currentView === 'api-test'}
		<div class="api-test-section">
			<div class="nav-back">
				<Button variant="secondary" size="sm" onclick={() => (currentView = 'intro')}>
					← Back to Menu
				</Button>
			</div>

			<Card variant="glass" class="api-test-card">
				<h2 class="section-title">🔌 Backend API Testing</h2>
				<p class="api-description">
					Test the real authentication and character creation endpoints. All requests go to the actual
					backend with SQLite database.
				</p>

				{#if isLoggedIn && currentUser}
					<div class="user-status">
						<p class="status-text">✅ Logged in as: <strong>{currentUser.username}</strong></p>
						<Button variant="secondary" size="sm" onclick={handleLogout}>Logout</Button>
					</div>
				{/if}

				<div class="api-forms">
					<!-- Register Form -->
					<div class="api-form-section">
						<h3 class="form-title">1. Register New User</h3>
						<div class="form-group">
							<label>Email:</label>
							<input
								type="email"
								bind:value={registerEmail}
								placeholder="user@example.com"
								class="form-input"
							/>
						</div>
						<div class="form-group">
							<label>Username:</label>
							<input
								type="text"
								bind:value={registerUsername}
								placeholder="username123"
								class="form-input"
							/>
						</div>
						<div class="form-group">
							<label>Password:</label>
							<input
								type="password"
								bind:value={registerPassword}
								placeholder="Min 8 chars, uppercase, lowercase, number"
								class="form-input"
							/>
						</div>
						<Button variant="primary" onclick={handleRegister}>Register</Button>
					</div>

					<!-- Login Form -->
					<div class="api-form-section">
						<h3 class="form-title">2. Login</h3>
						<div class="form-group">
							<label>Email:</label>
							<input
								type="email"
								bind:value={loginEmail}
								placeholder="user@example.com"
								class="form-input"
							/>
						</div>
						<div class="form-group">
							<label>Password:</label>
							<input type="password" bind:value={loginPassword} placeholder="Password" class="form-input" />
						</div>
						<Button variant="primary" onclick={handleLogin}>Login</Button>
					</div>

					<!-- Create Character Form -->
					<div class="api-form-section">
						<h3 class="form-title">3. Create Character</h3>
						{#if !isLoggedIn}
							<p class="warning-text">⚠️ You must login first to create a character</p>
						{/if}
						<div class="form-group">
							<label>Character Name:</label>
							<input
								type="text"
								bind:value={characterName}
								placeholder="Hero"
								class="form-input"
								disabled={!isLoggedIn}
							/>
						</div>
						<div class="form-group">
							<label>Class:</label>
							<select bind:value={characterClassId} class="form-input" disabled={!isLoggedIn}>
								<option value={1}>Warrior</option>
								<option value={2}>Mage</option>
								<option value={3}>Rogue</option>
							</select>
						</div>
						<Button variant="primary" onclick={handleCreateCharacterAPI} disabled={!isLoggedIn}>
							Create Character
						</Button>
					</div>
				</div>

				<!-- Response Display -->
				{#if apiResponse}
					<div class="api-response">
						<h3 class="response-title">Response:</h3>
						<pre class="response-content">{apiResponse}</pre>
					</div>
				{/if}
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

	/* API Testing Styles */
	.api-test-section {
		max-width: 1200px;
		margin: 0 auto;
	}

	.api-test-card {
		padding: 2rem;
	}

	.api-description {
		font-size: 1rem;
		color: var(--color-gray-11);
		margin-bottom: 2rem;
		text-align: center;
	}

	.user-status {
		background: var(--color-green-3);
		border: 1px solid var(--color-green-6);
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.status-text {
		color: var(--color-green-11);
		margin: 0;
	}

	.api-forms {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.api-form-section {
		background: var(--color-gray-2);
		border: 1px solid var(--color-gray-6);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.form-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-primary-11);
		margin-bottom: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-11);
		margin-bottom: 0.5rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-gray-1);
		border: 1px solid var(--color-gray-6);
		border-radius: 0.375rem;
		color: var(--color-gray-12);
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-8);
		box-shadow: 0 0 0 3px var(--color-primary-4);
	}

	.form-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.warning-text {
		color: var(--color-amber-11);
		font-size: 0.875rem;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background: var(--color-amber-3);
		border-radius: 0.25rem;
	}

	.api-response {
		background: var(--color-gray-1);
		border: 1px solid var(--color-gray-6);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.response-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-gray-12);
		margin-bottom: 1rem;
	}

	.response-content {
		background: var(--color-gray-2);
		padding: 1rem;
		border-radius: 0.375rem;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		color: var(--color-gray-12);
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
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

		.api-forms {
			grid-template-columns: 1fr;
		}
	}
</style>
