/**
 * Test Character Creation
 */

import { getDatabase } from '../server/database/connection';
import { CharacterClassRepository } from '../server/database/repositories/character-class';
import { createCharacter } from '../server/database/repositories/character';

console.log('🧪 Testing character creation...\n');

try {
	const db = getDatabase();
	const classRepo = new CharacterClassRepository(db);

	// Get first character class
	const classes = classRepo.getAll();
	console.log('Available classes:', classes.length);

	if (classes.length === 0) {
		console.error('❌ No character classes found!');
		process.exit(1);
	}

	const warriorClass = classes[0];
	console.log('Creating character with class:', warriorClass.name);
	console.log('Base stats:', warriorClass.base_stats);

	// Create character
	const character = createCharacter({
		user_id: 2, // User we created earlier
		name: 'TestHero',
		class_id: warriorClass.id,
		level: 1,
		xp: 0,
		hp: warriorClass.base_stats.hp,
		max_hp: warriorClass.base_stats.hp,
		stats: warriorClass.base_stats,
		currency: 100,
		position_x: 0,
		position_y: 0,
		position_z: 0,
		zone_id: null,
		status: 'alive'
	});

	console.log('\n✅ Character created successfully!');
	console.log('Character:', {
		id: character.id,
		name: character.name,
		class_id: character.class_id,
		level: character.level,
		hp: character.hp,
		max_hp: character.max_hp
	});

	process.exit(0);
} catch (error) {
	console.error('❌ Character creation failed:', error);
	process.exit(1);
}
