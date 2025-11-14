/**
 * Dungeon Descend API Endpoint
 * POST /api/dungeon/descend - Descend to next floor
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { descendFloor } from '$server/game/dungeon/manager';

/**
 * POST /api/dungeon/descend
 * Move to the next dungeon floor
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const { dungeonProgressId } = await request.json();

		// Validate input
		if (!dungeonProgressId || typeof dungeonProgressId !== 'number') {
			throw error(400, 'Dungeon progress ID is required');
		}

		// Descend to next floor
		const result = descendFloor(dungeonProgressId);

		return json({
			success: true,
			...result
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to descend floor';
		console.error('Failed to descend floor:', err);
		throw error(500, message);
	}
};
