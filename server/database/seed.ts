/**
 * Database Seeding
 * Initial data for character classes, zones, and starter content
 */

import { getDatabase } from './connection';
import { CharacterClassRepository } from './repositories/character-class';

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
 * Run all seed functions
 */
export function seedDatabase(): void {
	console.log('🌱 Seeding database...');

	try {
		seedCharacterClasses();
		// Additional seed functions will be added here as we implement more features
		// seedZones();
		// seedQuests();
		// seedItems();

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
