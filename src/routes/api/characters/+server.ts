/**
 * Characters List API Endpoint
 * GET /api/characters - List all characters for current player
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '../../../../server/database/connection.js';

export const GET: RequestHandler = async ({ locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const db = getDatabase();
		const playerId = locals.session.userId;

		const characters = db
			.prepare(
				`
			SELECT
				c.id,
				c.name,
				c.level,
				c.current_hp as hp,
				c.max_hp as maxHp,
				c.experience as xp,
				c.currency,
				cc.name as class
			FROM characters c
			JOIN character_classes cc ON c.class_id = cc.id
			WHERE c.player_id = ?
			ORDER BY c.id DESC
			LIMIT 100
		`
			)
			.all(playerId);

		return json({
			characters,
			count: characters.length
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Error fetching characters:', err);
		return json({ error: 'Failed to fetch characters' }, { status: 500 });
	}
};
