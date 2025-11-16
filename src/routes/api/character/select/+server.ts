/**
 * Character Selection API Endpoint
 * POST /api/character/select - Select a character and persist in session
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CharacterRepository } from '$server/database/repositories/character';
import { getDatabase } from '$server/database/connection';
import { updateSession } from '../../../../../server/websocket/session-memory';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterId } = await request.json();

		if (!characterId || typeof characterId !== 'number') {
			throw error(400, 'Character ID is required');
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

		// Update session with selected character
		const sessionId = cookies.get('session_id');
		if (sessionId) {
			await updateSession(sessionId, {
				characterId: character.id
			});

			// Update locals for current request
			locals.session.characterId = character.id;
			locals.characterId = character.id;
		}

		return json({
			success: true,
			character: {
				id: character.id,
				name: character.name,
				class: character.class_id,
				level: character.level,
				hp: character.current_hp,
				maxHp: character.max_hp,
				xp: character.experience,
				currency: character.currency
			}
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		console.error('Failed to select character:', err);
		throw error(500, 'Failed to select character');
	}
};
