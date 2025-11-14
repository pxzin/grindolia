/**
 * Character Detail Page Server
 * Load character data
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const characterId = parseInt(params.id, 10);

		if (isNaN(characterId)) {
			throw error(400, 'Invalid character ID');
		}

		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);
		const character = characterRepo.findById(characterId);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.player_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Get character class
		const classRepo = new CharacterClassRepository(db);
		const characterClass = classRepo.findById(character.class_id);

		return {
			character: {
				id: character.id,
				name: character.name,
				class: characterClass?.name || 'Unknown',
				level: character.level,
				xp: character.experience,
				hp: character.current_hp,
				maxHp: character.max_hp,
				stats: {
					hp: character.max_hp,
					strength: character.strength,
					intelligence: character.intelligence,
					dexterity: character.dexterity,
					vitality: character.vitality
				},
				currency: character.currency,
				position: { x: 0, y: 0, z: 0 },
				zoneId: null,
				status: 'alive' as const
			}
		};
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to load character:', err);
		throw error(500, 'Failed to load character');
	}
};
