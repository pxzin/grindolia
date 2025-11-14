/**
 * WebSocket Message Router
 * Routes incoming messages to appropriate handlers
 */

import type { WebSocketConnection } from '../server';
import type { WebSocketMessage } from '../../../src/lib/types/websocket';

/**
 * Message handler function type
 */
export type MessageHandler = (
	connection: WebSocketConnection,
	message: WebSocketMessage
) => Promise<void>;

/**
 * Message handlers registry
 * Maps message types to their handler functions
 */
const handlers: Record<string, MessageHandler> = {
	// Quest handlers (will be implemented in Phase 3)
	// QUEST_START: handleQuestStart,
	// QUEST_COMPLETE: handleQuestComplete,

	// Arena handlers (will be implemented in Phase 6)
	// ARENA_INITIATE: handleArenaInitiate,

	// Auction handlers (will be implemented in Phase 7)
	// AUCTION_BID: handleAuctionBid,

	// System handlers
	HEARTBEAT: handleHeartbeat
};

/**
 * Handle heartbeat messages
 */
async function handleHeartbeat(
	connection: WebSocketConnection,
	_message: WebSocketMessage
): Promise<void> {
	// Heartbeat is already handled in server.ts
	// This is just an acknowledgment
	connection.lastHeartbeat = Date.now();
}

/**
 * Main message router
 */
export async function handleMessage(
	connection: WebSocketConnection,
	message: WebSocketMessage
): Promise<void> {
	const handler = handlers[message.type];

	if (!handler) {
		console.warn(`No handler found for message type: ${message.type}`);
		return;
	}

	try {
		await handler(connection, message);
	} catch (error) {
		console.error(`Error handling message type ${message.type}:`, error);

		// Send error response to client
		if (connection.ws.readyState === 1) {
			connection.ws.send(
				JSON.stringify({
					type: 'ERROR',
					timestamp: Date.now(),
					payload: {
						originalType: message.type,
						error: 'Message processing failed'
					}
				})
			);
		}
	}
}

/**
 * Register a new message handler
 */
export function registerHandler(type: string, handler: MessageHandler): void {
	handlers[type] = handler;
	console.log(`✅ Registered handler for: ${type}`);
}

/**
 * Get all registered message types
 */
export function getRegisteredTypes(): string[] {
	return Object.keys(handlers);
}
