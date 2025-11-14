/**
 * Character API Endpoints
 * POST /api/character - Create new character
 * GET /api/character - Get character details
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCharacter, getCharacterById } from '$server/database/repositories/character';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';
import { addItem } from '$server/database/repositories/inventory-item';

/**
 * POST /api/character
 * Create a new character
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { name, classId } = await request.json();

		// Validate input
		if (!name || typeof name !== 'string') {
			throw error(400, 'Character name is required');
		}

		if (!classId || typeof classId !== 'number') {
			throw error(400, 'Character class is required');
		}

		// Validate name length
		if (name.length < 2 || name.length > 20) {
			throw error(400, 'Character name must be between 2 and 20 characters');
		}

		// Validate class exists
		const db = getDatabase();
		const classRepo = new CharacterClassRepository(db);
		const characterClass = classRepo.getById(classId);

		if (!characterClass) {
			throw error(400, 'Invalid character class');
		}

		// Create character
		const character = createCharacter({
			user_id: locals.session.userId,
			name,
			class_id: classId,
			level: 1,
			xp: 0,
			hp: characterClass.base_stats.hp,
			max_hp: characterClass.base_stats.hp,
			stats: characterClass.base_stats,
			currency: 100, // Starting currency
			position_x: 0,
			position_y: 0,
			position_z: 0,
			zone_id: null,
			status: 'alive'
		});

		// Add starting equipment to inventory
		if (characterClass.starting_equipment && characterClass.starting_equipment.length > 0) {
			for (const itemId of characterClass.starting_equipment) {
				addItem(character.id, itemId, 1, false);
			}
		}

		return json({
			success: true,
			character: {
				id: character.id,
				name: character.name,
				class: characterClass.name,
				level: character.level,
				xp: character.xp,
				hp: character.hp,
				maxHp: character.max_hp,
				stats: character.stats,
				currency: character.currency
			}
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to create character:', err);
		throw error(500, 'Failed to create character');
	}
};

/**
 * GET /api/character?id=123
 * Get character details
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const characterIdParam = url.searchParams.get('id');

		if (!characterIdParam) {
			throw error(400, 'Character ID is required');
		}

		const characterId = parseInt(characterIdParam, 10);

		if (isNaN(characterId)) {
			throw error(400, 'Invalid character ID');
		}

		const character = getCharacterById(characterId);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.user_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Get character class
		const db = getDatabase();
		const classRepo = new CharacterClassRepository(db);
		const characterClass = classRepo.getById(character.class_id);

		return json({
			success: true,
			character: {
				id: character.id,
				name: character.name,
				class: characterClass?.name || 'Unknown',
				level: character.level,
				xp: character.xp,
				hp: character.hp,
				maxHp: character.max_hp,
				stats: character.stats,
				currency: character.currency,
				position: {
					x: character.position_x,
					y: character.position_y,
					z: character.position_z
				},
				zoneId: character.zone_id,
				status: character.status
			}
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to get character:', err);
		throw error(500, 'Failed to get character');
	}
};
