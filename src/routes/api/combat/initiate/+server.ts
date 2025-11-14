/**
 * Combat Initiate API Endpoint
 * POST /api/combat/initiate - Start combat with a monster
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { initiateCombat } from '$server/game/dungeon/manager';

/**
 * POST /api/combat/initiate
 * Start a combat encounter
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterId, dungeonProgressId } = await request.json();

		// Validate input
		if (!characterId || typeof characterId !== 'number') {
			throw error(400, 'Character ID is required');
		}

		if (!dungeonProgressId || typeof dungeonProgressId !== 'number') {
			throw error(400, 'Dungeon progress ID is required');
		}

		// Initiate combat
		const result = initiateCombat(characterId, dungeonProgressId);

		return json({
			success: true,
			...result
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw error;
		}

		const message = err instanceof Error ? err.message : 'Failed to initiate combat';
		console.error('Failed to initiate combat:', err);
		throw error(500, message);
	}
};
