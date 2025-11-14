/**
 * Quest Complete API Endpoint
 * POST /api/quest/complete - Complete a quest
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCharacterQuestById } from '$server/database/repositories/character-quest';
import { CharacterRepository } from '$server/database/repositories/character';
import { getDatabase } from '$server/database/connection';
import { completeQuest } from '$server/game/quest/manager';

/**
 * POST /api/quest/complete
 * Complete a quest and receive rewards
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterQuestId } = await request.json();

		// Validate input
		if (!characterQuestId || typeof characterQuestId !== 'number') {
			throw error(400, 'Character quest ID is required');
		}

		const characterQuest = getCharacterQuestById(characterQuestId);

		if (!characterQuest) {
			throw error(404, 'Quest not found');
		}

		const db = getDatabase();
		const characterRepo = new CharacterRepository(db);
		const character = characterRepo.findById(characterQuest.character_id);

		if (!character) {
			throw error(404, 'Character not found');
		}

		// Verify ownership
		if (character.player_id !== locals.session.userId) {
			throw error(403, 'Access denied');
		}

		// Complete quest
		const result = await completeQuest(characterQuestId);

		if (!result.success) {
			throw error(400, result.error || 'Failed to complete quest');
		}

		return json({
			success: true,
			rewards: result.rewards
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Failed to complete quest:', err);
		throw error(500, 'Failed to complete quest');
	}
};
