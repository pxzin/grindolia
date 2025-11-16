/**
 * Quests Page Server Load Function
 * Pass session character ID to client
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.session?.userId) {
		throw redirect(302, '/auth/login');
	}

	// Redirect to character selection if no character
	if (!locals.session.characterId) {
		throw redirect(302, '/character/select');
	}

	return {
		characterId: locals.session.characterId,
		userId: locals.session.userId
	};
};
