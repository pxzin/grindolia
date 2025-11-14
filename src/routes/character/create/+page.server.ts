/**
 * Character Creation Page Server
 * Load character classes for creation
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CharacterClassRepository } from '$server/database/repositories/character-class';
import { getDatabase } from '$server/database/connection';

export const load: PageServerLoad = async ({ locals }) => {
	// Check authentication
	if (!locals.session?.userId) {
		throw error(401, 'Authentication required');
	}

	try {
		const db = getDatabase();
		const classRepo = new CharacterClassRepository(db);
		const classes = classRepo.getAll();

		return {
			classes: classes.map((c) => ({
				id: c.id,
				name: c.name,
				description: c.description
			}))
		};
	} catch (err) {
		console.error('Failed to load character classes:', err);
		throw error(500, 'Failed to load character classes');
	}
};
