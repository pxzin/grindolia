/**
 * SvelteKit Server Hooks
 * Authentication middleware and request handling
 */

import type { Handle } from '@sveltejs/kit';
import { getSession } from '../server/websocket/session-memory';
import { initializeDatabase } from '../server/database/connection';
import { seedDatabase } from '../server/database/seed';

// Initialize database on startup
let dbInitialized = false;
if (!dbInitialized) {
	try {
		console.log('🔧 Initializing database...');
		initializeDatabase();
		seedDatabase();
		dbInitialized = true;
	} catch (error) {
		console.error('Failed to initialize database:', error);
	}
}

/**
 * Authentication middleware
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Extract session ID from cookie
	const sessionId = event.cookies.get('session_id');

	if (sessionId) {
		try {
			// Get session data from in-memory store
			const session = await getSession(sessionId);

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
