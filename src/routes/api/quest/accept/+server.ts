/**
 * Quest Accept API Endpoint
 * POST /api/quest/accept - Accept a quest
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCharacterById } from '$server/database/repositories/character';
import { acceptQuest } from '$server/game/quest/manager';

/**
 * POST /api/quest/accept
 * Accept a quest for a character
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterId, questTemplateId } = await request.json();

		// Validate input
		if (!characterId || typeof characterId !== 'number') {
			throw error(400, 'Character ID is required');
		}

		if (!questTemplateId || typeof questTemplateId !== 'number') {
			throw error(400, 'Quest template ID is required');
		}

		const character = getCharacterById(characterId);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.user_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Accept quest
		const result = acceptQuest(characterId, questTemplateId);

		if (!result.success) {
			throw error(400, result.error || 'Failed to accept quest');
		}

		return json({
			success: true,
			questId: result.questId
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to accept quest:', err);
		throw error(500, 'Failed to accept quest');
	}
};
