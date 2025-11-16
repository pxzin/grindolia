/**
 * Town Hall Server Load Function
 * Pass session character ID to client
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.session?.userId) {
		throw redirect(302, '/auth/login');
	}

	// Return the character ID from session (if any)
	return {
		characterId: locals.session.characterId || null,
		userId: locals.session.userId
	};
};
