/**
 * WebSocket Server Setup
 * Manages WebSocket connections and message routing
 */

import type { WebSocket } from 'ws';
import type { WebSocketMessage } from '../../src/lib/types/websocket';
import { getSession, updateSession } from './session';
import { handleMessage } from './handlers/index';

export interface WebSocketConnection {
	ws: WebSocket;
	sessionId: string;
	userId: number;
	characterId?: number;
	connectedAt: number;
	lastHeartbeat: number;
}

// Store active connections
const connections = new Map<string, WebSocketConnection>();

/**
 * Add a new WebSocket connection
 */
export function addConnection(sessionId: string, ws: WebSocket, userId: number): void {
	const connection: WebSocketConnection = {
		ws,
		sessionId,
		userId,
		connectedAt: Date.now(),
		lastHeartbeat: Date.now()
	};

	connections.set(sessionId, connection);
	console.log(`✅ WebSocket connected: ${sessionId} (User: ${userId})`);
}

/**
 * Remove a WebSocket connection
 */
export function removeConnection(sessionId: string): void {
	const connection = connections.get(sessionId);
	if (connection) {
		connections.delete(sessionId);
		console.log(`❌ WebSocket disconnected: ${sessionId}`);
	}
}

/**
 * Get connection by session ID
 */
export function getConnection(sessionId: string): WebSocketConnection | undefined {
	return connections.get(sessionId);
}

/**
 * Get all active connections
 */
export function getAllConnections(): WebSocketConnection[] {
	return Array.from(connections.values());
}

/**
 * Send message to a specific connection
 */
export function sendToConnection(sessionId: string, message: WebSocketMessage): void {
	const connection = connections.get(sessionId);
	if (connection && connection.ws.readyState === 1) {
		// 1 = OPEN
		connection.ws.send(JSON.stringify(message));
	}
}

/**
 * Broadcast message to all connections
 */
export function broadcast(message: WebSocketMessage): void {
	for (const connection of connections.values()) {
		if (connection.ws.readyState === 1) {
			connection.ws.send(JSON.stringify(message));
		}
	}
}

/**
 * Broadcast to specific user's connections
 */
export function broadcastToUser(userId: number, message: WebSocketMessage): void {
	for (const connection of connections.values()) {
		if (connection.userId === userId && connection.ws.readyState === 1) {
			connection.ws.send(JSON.stringify(message));
		}
	}
}

/**
 * Handle incoming WebSocket message
 */
export async function handleIncomingMessage(
	sessionId: string,
	data: string
): Promise<void> {
	try {
		const message = JSON.parse(data) as WebSocketMessage;
		const connection = connections.get(sessionId);

		if (!connection) {
			console.error('Connection not found:', sessionId);
			return;
		}

		// Update last activity
		connection.lastHeartbeat = Date.now();

		// Update session in Redis
		await updateSession(sessionId, {
			lastActivity: Date.now()
		});

		// Route message to appropriate handler
		await handleMessage(connection, message);
	} catch (error) {
		console.error('Error handling WebSocket message:', error);
	}
}

/**
 * Setup heartbeat monitoring
 * Pings connections every 30 seconds and removes stale connections
 */
export function setupHeartbeat(): NodeJS.Timeout {
	return setInterval(() => {
		const now = Date.now();
		const timeout = 60000; // 60 seconds

		for (const [sessionId, connection] of connections.entries()) {
			if (now - connection.lastHeartbeat > timeout) {
				console.log(`⚠️ Connection timeout: ${sessionId}`);
				connection.ws.close();
				removeConnection(sessionId);
			} else {
				// Send heartbeat ping
				if (connection.ws.readyState === 1) {
					sendToConnection(sessionId, {
						type: 'HEARTBEAT',
						timestamp: Date.now(),
						payload: {}
					});
				}
			}
		}
	}, 30000); // Every 30 seconds
}

/**
 * Get connection count
 */
export function getConnectionCount(): number {
	return connections.size;
}
