/**
 * Development API - Reset Quests
 * DELETE /api/dev/reset-quests - Reset all active quests for a character
 *
 * ⚠️ DEVELOPMENT ONLY - Should be disabled in production
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$server/database/connection';

/**
 * DELETE /api/dev/reset-quests?characterId=123
 * Resets all active quests for testing
 */
export const DELETE: RequestHandler = async ({ url, locals }) => {
	// Check if in development mode
	if (process.env.NODE_ENV === 'production') {
		throw error(403, 'This endpoint is only available in development mode');
	}

	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const characterIdParam = url.searchParams.get('characterId');

		if (!characterIdParam) {
			throw error(400, 'Character ID is required');
		}

		const characterId = parseInt(characterIdParam, 10);

		if (isNaN(characterId)) {
			throw error(400, 'Invalid character ID');
		}

		const db = getDatabase();

		// Delete all character quests for this character
		const deleteStmt = db.prepare('DELETE FROM character_quests WHERE character_id = ?');
		const result = deleteStmt.run(characterId);

		console.log(`🧹 [DEV] Reset quests for character ${characterId}:`, result.changes, 'quests deleted');

		return json({
			success: true,
			message: `Reset ${result.changes} active quest(s)`,
			deletedCount: result.changes
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		console.error('Failed to reset quests:', err);
		throw error(500, 'Failed to reset quests');
	}
};
