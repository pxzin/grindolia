/**
 * Character API Endpoints
 * POST /api/character - Create new character
 * GET /api/character - Get character details
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';

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
		const characterClass = classRepo.findById(classId);

		if (!characterClass) {
			throw error(400, 'Invalid character class');
		}

		// Parse base stats from JSON
		const baseStats = classRepo.parseBaseStats(characterClass);

		// Create character
		const characterRepo = new CharacterRepository(db);
		const character = characterRepo.create({
			player_id: locals.session.userId,
			name,
			class_id: classId,
			experience_to_next_level: 100, // XP needed for level 2
			current_hp: baseStats.hp,
			max_hp: baseStats.hp,
			strength: baseStats.strength,
			intelligence: baseStats.intelligence,
			dexterity: baseStats.dexterity,
			vitality: baseStats.vitality,
			appearance: {
				skin_tone: 'default',
				hair_color: 'brown',
				face: 'default'
			}
		});

		return json({
			success: true,
			character: {
				id: character.id,
				name: character.name,
				class: characterClass.name,
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

		return json({
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
				currency: character.currency
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
