/**
 * Database Seeding
 * Initial data for character classes, zones, and starter content
 */

import { getDatabase } from './connection';
import { CharacterClassRepository } from './repositories/character-class';
import { createZone } from './repositories/zone';
import { createQuestTemplate } from './repositories/quest-template';
import { createItemTemplate } from './repositories/item-template';

/**
 * Seed initial character classes
 */
export function seedCharacterClasses(): void {
	const db = getDatabase();
	const repo = new CharacterClassRepository(db);

	const classes = [
		{
			name: 'Warrior',
			description: 'A mighty fighter skilled in close combat and heavy armor. High HP and strength make warriors perfect for frontline battles.',
			base_stats: {
				hp: 120,
				strength: 15,
				intelligence: 5,
				dexterity: 8,
				vitality: 12
			},
			stat_growth: {
				hp_per_level: 15,
				strength_per_level: 3,
				intelligence_per_level: 1,
				dexterity_per_level: 1,
				vitality_per_level: 2
			},
			starting_equipment: [] // Will be populated with item IDs when items are created
		},
		{
			name: 'Mage',
			description: 'A master of arcane arts who wields devastating spells. High intelligence and magical power, but low physical defense.',
			base_stats: {
				hp: 80,
				strength: 5,
				intelligence: 18,
				dexterity: 7,
				vitality: 6
			},
			stat_growth: {
				hp_per_level: 8,
				strength_per_level: 1,
				intelligence_per_level: 4,
				dexterity_per_level: 1,
				vitality_per_level: 1
			},
			starting_equipment: []
		},
		{
			name: 'Rogue',
			description: 'A swift and cunning fighter who strikes from the shadows. High dexterity enables critical hits and dodging attacks.',
			base_stats: {
				hp: 100,
				strength: 10,
				intelligence: 8,
				dexterity: 16,
				vitality: 9
			},
			stat_growth: {
				hp_per_level: 12,
				strength_per_level: 2,
				intelligence_per_level: 1,
				dexterity_per_level: 3,
				vitality_per_level: 1
			},
			starting_equipment: []
		}
	];

	let seededCount = 0;

	for (const classData of classes) {
		if (!repo.nameExists(classData.name)) {
			repo.create(classData);
			seededCount++;
			console.log(`  ✓ Seeded character class: ${classData.name}`);
		}
	}

	if (seededCount > 0) {
		console.log(`✅ Seeded ${seededCount} character classes`);
	} else {
		console.log('ℹ️  Character classes already seeded');
	}
}

/**
 * Seed starter zone
 */
export function seedZones(): void {
	const db = getDatabase();

	// Check if starter zone exists
	const checkStmt = db.prepare('SELECT COUNT(*) as count FROM zones WHERE name = ?');
	const result = checkStmt.get('Starter Plains') as { count: number };

	if (result.count === 0) {
		createZone({
			name: 'Starter Plains',
			description: 'A peaceful meadow where new adventurers begin their journey. Gentle creatures roam the grasslands.',
			min_level: 1,
			max_level: 5
		});
		console.log('  ✓ Seeded zone: Starter Plains');
	}
}

/**
 * Seed tutorial quest
 */
export function seedQuests(): void {
	const db = getDatabase();

	// Check if tutorial quest exists
	const checkStmt = db.prepare('SELECT COUNT(*) as count FROM quest_templates WHERE title = ?');
	const result = checkStmt.get('Welcome to the New World') as { count: number };

	if (result.count === 0) {
		// Get starter zone ID
		const zoneStmt = db.prepare('SELECT id FROM zones WHERE name = ?');
		const zone = zoneStmt.get('Starter Plains') as { id: number } | null;

		createQuestTemplate({
			title: 'Welcome to the New World',
			description: 'You have been transported to a mysterious new world. Explore your surroundings and learn the basics of survival.',
			zone_id: zone?.id || null,
			min_level: 1,
			max_level: null,
			objectives: [
				{
					type: 'explore',
					description: 'Explore the Starter Plains',
					target: 'starter_plains',
					required: 1,
					current: 0
				},
				{
					type: 'kill',
					description: 'Defeat 3 Slimes',
					target: 'slime',
					required: 3,
					current: 0
				}
			],
			rewards: {
				xp: 100,
				currency: 50,
				items: []
			},
			is_repeatable: false,
			cooldown_hours: null
		});
		console.log('  ✓ Seeded quest: Welcome to the New World');
	}
}

/**
 * Seed starting equipment items
 */
export function seedItems(): void {
	const db = getDatabase();

	const items = [
		{
			name: 'Rusty Sword',
			description: 'A basic sword, worn but still functional.',
			type: 'weapon' as const,
			rarity: 'common' as const,
			level_requirement: 1,
			stats: { damage: 5, strength: 2 },
			effects: null,
			max_stack: 1,
			icon_path: null
		},
		{
			name: 'Wooden Staff',
			description: 'A simple wooden staff imbued with minor magical properties.',
			type: 'weapon' as const,
			rarity: 'common' as const,
			level_requirement: 1,
			stats: { damage: 4, intelligence: 3 },
			effects: null,
			max_stack: 1,
			icon_path: null
		},
		{
			name: 'Iron Dagger',
			description: 'A sharp dagger perfect for quick strikes.',
			type: 'weapon' as const,
			rarity: 'common' as const,
			level_requirement: 1,
			stats: { damage: 4, dexterity: 3 },
			effects: null,
			max_stack: 1,
			icon_path: null
		},
		{
			name: 'Leather Armor',
			description: 'Basic leather protection for adventurers.',
			type: 'armor' as const,
			rarity: 'common' as const,
			level_requirement: 1,
			stats: { defense: 5, vitality: 2 },
			effects: null,
			max_stack: 1,
			icon_path: null
		},
		{
			name: 'Health Potion',
			description: 'Restores 50 HP when consumed.',
			type: 'consumable' as const,
			rarity: 'common' as const,
			level_requirement: 1,
			stats: null,
			effects: { heal_hp: 50 },
			max_stack: 99,
			icon_path: null
		}
	];

	let seededCount = 0;

	for (const item of items) {
		const checkStmt = db.prepare('SELECT COUNT(*) as count FROM item_templates WHERE name = ?');
		const result = checkStmt.get(item.name) as { count: number };

		if (result.count === 0) {
			createItemTemplate(item);
			seededCount++;
			console.log(`  ✓ Seeded item: ${item.name}`);
		}
	}

	if (seededCount > 0) {
		console.log(`✅ Seeded ${seededCount} items`);
	}
}

/**
 * Run all seed functions
 */
export function seedDatabase(): void {
	console.log('🌱 Seeding database...');

	try {
		seedCharacterClasses();
		seedZones();
		seedQuests();
		seedItems();

		console.log('✅ Database seeding completed');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		throw error;
	}
}

// Run seed if called directly
if (require.main === module) {
	seedDatabase();
}
