/**
 * Dungeon Page Server Load
 * Load character data for the dungeon page
 */

import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.session?.userId) {
		throw redirect(302, '/auth/login');
	}

	return {
		userId: locals.session.userId
	};
};
