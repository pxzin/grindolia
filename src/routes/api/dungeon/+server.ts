/**
 * Dungeon List API Endpoint
 * GET /api/dungeon - Get available dungeons
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DungeonRepository } from '$server/database/repositories/dungeon';
import { getDatabase } from '$server/database/connection';

/**
 * GET /api/dungeon
 * Get list of available dungeons
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const db = getDatabase();
		const dungeonRepo = new DungeonRepository(db);

		const dungeons = dungeonRepo.findAll();

		return json({
			success: true,
			dungeons: dungeons.map(d => ({
				id: d.id,
				name: d.name,
				description: d.description,
				min_level: d.min_level,
				max_floors: d.max_floors,
				theme: d.theme
			}))
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		console.error('Failed to get dungeons:', err);
		throw error(500, 'Failed to get dungeons');
	}
};
