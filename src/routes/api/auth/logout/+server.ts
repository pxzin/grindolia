/**
 * Logout API Endpoint
 * POST /api/auth/logout - Clear session and cookie
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { deleteSession } from '../../../../../server/websocket/session-memory';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');

	if (sessionId) {
		// Delete session from memory store
		await deleteSession(sessionId);

		// Clear the cookie
		cookies.delete('session_id', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false // Set to true in production with HTTPS
		});
	}

	return json({
		success: true,
		message: 'Logged out successfully'
	});
};
