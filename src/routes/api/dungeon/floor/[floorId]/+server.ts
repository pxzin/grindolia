/**
 * Dungeon Floor API Endpoint
 * GET /api/dungeon/floor/[floorId] - Get floor information
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFloorInfo } from '$server/game/dungeon/manager';

/**
 * GET /api/dungeon/floor/[floorId]
 * Get information about a dungeon floor
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const dungeonProgressId = parseInt(params.floorId);

		if (isNaN(dungeonProgressId)) {
			throw error(400, 'Invalid floor ID');
		}

		const floorInfo = getFloorInfo(dungeonProgressId);

		return json({
			success: true,
			floor: floorInfo
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to get floor info';
		console.error('Failed to get floor info:', err);
		throw error(500, message);
	}
};
