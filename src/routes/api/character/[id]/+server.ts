/**
 * Character by ID API Endpoint
 * GET /api/character/:id - Get specific character details
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';

/**
 * GET /api/character/:id
 * Get specific character details by ID
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const characterId = parseInt(params.id, 10);

		if (isNaN(characterId)) {
			throw error(400, 'Invalid character ID');
		}

		console.log('🔍 [API/Character/:id] GET request - characterId:', characterId);

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

		const response = {
			success: true,
			character: {
				id: character.id,
				name: character.name,
				class: characterClass?.name || 'Unknown',
				level: character.level,
				xp: character.experience,
				hp: character.current_hp,
				maxHp: character.max_hp,
				stats: {
					strength: character.strength,
					intelligence: character.intelligence,
					dexterity: character.dexterity,
					vitality: character.vitality,
					hp: character.max_hp
				},
				currency: character.currency,
				position: { x: 0, y: 0, z: 0 },
				zoneId: null,
				status: 'alive' as const,
				currentDungeonFloor: character.current_dungeon_floor || 0
			}
		};

		console.log('📤 [API/Character/:id] Sending response for:', character.name);
		return json(response);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to get character:', err);
		throw error(500, 'Failed to get character');
	}
};
