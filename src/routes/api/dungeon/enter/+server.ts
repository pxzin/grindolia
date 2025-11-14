/**
 * Dungeon Enter API Endpoint
 * POST /api/dungeon/enter - Enter a dungeon
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enterDungeon } from '$server/game/dungeon/manager';

/**
 * POST /api/dungeon/enter
 * Character enters a dungeon
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterId, dungeonId } = await request.json();

		// Validate input
		if (!characterId || typeof characterId !== 'number') {
			throw error(400, 'Character ID is required');
		}

		if (!dungeonId || typeof dungeonId !== 'number') {
			throw error(400, 'Dungeon ID is required');
		}

		// Enter dungeon
		const result = enterDungeon(characterId, dungeonId);

		return json({
			success: true,
			...result
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to enter dungeon';
		console.error('Failed to enter dungeon:', err);
		throw error(500, message);
	}
};
