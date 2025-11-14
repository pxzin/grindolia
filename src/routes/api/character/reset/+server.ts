/**
 * Character Reset API Endpoint
 * POST /api/character/reset - Reset character to level 1 (for testing)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';

/**
 * POST /api/character/reset
 * Reset character to level 1 with base stats
 */
export const POST: RequestHandler = async ({ locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);

		// Get user's first character
		const characters = characterRepo.findByPlayerId(locals.session.userId);

		if (!characters || characters.length === 0) {
			throw error(404, 'No character found');
		}

		const character = characters[0];

		// Get character class for base stats
		const classRepo = new CharacterClassRepository(db);
		const characterClass = classRepo.findById(character.class_id);

		if (!characterClass) {
			throw error(404, 'Character class not found');
		}

		// Parse base stats
		const baseStats = classRepo.parseBaseStats(characterClass);

		// Reset character to level 1
		characterRepo.update(character.id, {
			level: 1,
			experience: 0,
			current_hp: baseStats.hp,
			max_hp: baseStats.hp,
			strength: baseStats.strength,
			intelligence: baseStats.intelligence,
			dexterity: baseStats.dexterity,
			vitality: baseStats.vitality,
			currency: 0
		});

		console.log(`🔄 [API/Character/Reset] Reset character ${character.id} to level 1`);

		return json({
			success: true,
			message: 'Character reset to level 1'
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to reset character:', err);
		throw error(500, 'Failed to reset character');
	}
};
