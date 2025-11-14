/**
 * WebSocket Upgrade Handler
 * Handles WebSocket connection upgrades for SvelteKit
 */

import type { RequestHandler } from './$types';
import { WebSocketServer } from 'ws';
import { getSession } from '../../../../server/websocket/session';
import {
	addConnection,
	removeConnection,
	handleIncomingMessage,
	setupHeartbeat
} from '../../../../server/websocket/server';

// Create WebSocket server instance
const wss = new WebSocketServer({ noServer: true });

// Setup heartbeat monitoring
setupHeartbeat();

/**
 * Handle WebSocket upgrade requests
 */
export const GET: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated
	if (!locals.userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	// Extract session ID from cookie
	const cookies = request.headers.get('cookie');
	const sessionId = cookies
		?.split(';')
		.find((c) => c.trim().startsWith('session_id='))
		?.split('=')[1];

	if (!sessionId) {
		return new Response('No session found', { status: 401 });
	}

	// Verify session exists in Redis
	const session = await getSession(sessionId);
	if (!session) {
		return new Response('Invalid session', { status: 401 });
	}

	// This is a hack for SvelteKit to handle WebSocket upgrades
	// In production, you might want to use a separate WebSocket server
	return new Response('WebSocket endpoint - upgrade required', {
		status: 426,
		headers: {
			'Upgrade': 'websocket'
		}
	});
};

/**
 * Handle WebSocket upgrade (called by server)
 * Note: This needs to be integrated with your HTTP server
 */
export function handleUpgrade(request: Request, socket: any, head: Buffer): void {
	wss.handleUpgrade(request, socket, head, (ws) => {
		// Extract session ID from cookie
		const cookies = request.headers.get('cookie');
		const sessionId = cookies
			?.split(';')
			.find((c) => c.trim().startsWith('session_id='))
			?.split('=')[1];

		if (!sessionId) {
			ws.close(1008, 'No session found');
			return;
		}

		// Verify session and get user ID
		getSession(sessionId)
			.then((session) => {
				if (!session) {
					ws.close(1008, 'Invalid session');
					return;
				}

				// Add connection
				addConnection(sessionId, ws, session.userId);

				// Handle incoming messages
				ws.on('message', (data) => {
					handleIncomingMessage(sessionId, data.toString());
				});

				// Handle disconnection
				ws.on('close', () => {
					removeConnection(sessionId);
				});

				// Handle errors
				ws.on('error', (error) => {
					console.error('WebSocket error:', error);
					removeConnection(sessionId);
				});

				// Send welcome message
				ws.send(
					JSON.stringify({
						type: 'SYSTEM_BROADCAST',
						timestamp: Date.now(),
						payload: {
							message: 'Connected to game server',
							level: 'info'
						}
					})
				);
			})
			.catch((error) => {
				console.error('Session verification failed:', error);
				ws.close(1011, 'Server error');
			});
	});
}
