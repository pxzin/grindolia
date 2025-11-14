/**
 * Combat Resolve API Endpoint
 * POST /api/combat/resolve - Resolve combat and get results
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveCombat } from '$server/game/dungeon/manager';

/**
 * POST /api/combat/resolve
 * Resolve a combat encounter and apply rewards
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { characterId, dungeonProgressId, monsterId } = await request.json();

		// Validate input
		if (!characterId || typeof characterId !== 'number') {
			throw error(400, 'Character ID is required');
		}

		if (!dungeonProgressId || typeof dungeonProgressId !== 'number') {
			throw error(400, 'Dungeon progress ID is required');
		}

		if (!monsterId || typeof monsterId !== 'number') {
			throw error(400, 'Monster ID is required');
		}

		// Resolve combat
		const result = resolveCombat(characterId, dungeonProgressId, monsterId);

		return json({
			success: true,
			...result
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to resolve combat';
		console.error('Failed to resolve combat:', err);
		throw error(500, message);
	}
};
