/**
 * SvelteKit Server Hooks
 * Authentication middleware and request handling
 */

import type { Handle } from '@sveltejs/kit';
import { getSession } from '../server/websocket/session-memory';

/**
 * Authentication middleware
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Extract session ID from cookie
	const sessionId = event.cookies.get('session_id');

	console.log('[HOOKS] Request:', event.url.pathname, 'Session ID:', sessionId);

	if (sessionId) {
		try {
			// Get session data from in-memory store
			const session = await getSession(sessionId);

			console.log('[HOOKS] Session data:', session);

			if (session) {
				// Attach session data to locals for use in routes
				event.locals.session = session;
				event.locals.userId = session.userId;
				event.locals.username = session.username;
				event.locals.characterId = session.characterId;
			}
		} catch (error) {
			console.error('Session validation error:', error);
		}
	}

	// Continue with request
	const response = await resolve(event);

	return response;
};

/**
 * Type augmentation for SvelteKit locals
 */
declare global {
	namespace App {
		interface Locals {
			session?: {
				userId: number;
				characterId?: number;
				username: string;
				connectedAt: number;
				lastActivity: number;
			};
			userId?: number;
			username?: string;
			characterId?: number;
		}
	}
}
