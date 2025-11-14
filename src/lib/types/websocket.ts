/**
 * WebSocket Message Types
 * Type-safe message definitions for client-server communication
 */

// Base message structure
export interface BaseMessage {
	type: string;
	timestamp: number;
}

// Quest-related messages
export interface QuestStartMessage extends BaseMessage {
	type: 'QUEST_START';
	payload: {
		questId: number;
		characterId: number;
	};
}

export interface QuestProgressMessage extends BaseMessage {
	type: 'QUEST_PROGRESS';
	payload: {
		questId: number;
		characterId: number;
		progress: Record<string, number>;
	};
}

export interface QuestCompleteMessage extends BaseMessage {
	type: 'QUEST_COMPLETE';
	payload: {
		questId: number;
		characterId: number;
	};
}

export interface QuestCompletedMessage extends BaseMessage {
	type: 'QUEST_COMPLETED';
	payload: {
		questId: number;
		rewards: {
			xp: number;
			currency: number;
			items: Array<{ id: number; quantity: number }>;
		};
		levelUp?: {
			newLevel: number;
			newStats: Record<string, number>;
		};
	};
}

// Arena-related messages
export interface ArenaInitiateMessage extends BaseMessage {
	type: 'ARENA_INITIATE';
	payload: {
		characterId: number;
	};
}

export interface ArenaMatchFoundMessage extends BaseMessage {
	type: 'ARENA_MATCH_FOUND';
	payload: {
		combatId: number;
		opponent: {
			id: number;
			name: string;
			level: number;
		};
	};
}

export interface ArenaCombatResultMessage extends BaseMessage {
	type: 'ARENA_COMBAT_RESULT';
	payload: {
		combatId: number;
		winner: number;
		combatLog: Array<{ action: string; timestamp: number }>;
		rewards: {
			xp: number;
			currency: number;
			ratingChange: number;
		};
	};
}

// Auction-related messages
export interface AuctionBidMessage extends BaseMessage {
	type: 'AUCTION_BID';
	payload: {
		listingId: number;
		characterId: number;
	};
}

export interface AuctionSoldMessage extends BaseMessage {
	type: 'AUCTION_SOLD';
	payload: {
		listingId: number;
		buyerId: number;
		sellerId: number;
		price: number;
	};
}

// Leaderboard updates
export interface LeaderboardUpdateMessage extends BaseMessage {
	type: 'LEADERBOARD_UPDATE';
	payload: {
		category: string;
		topPlayers: Array<{
			rank: number;
			characterId: number;
			name: string;
			value: number;
		}>;
	};
}

// System messages
export interface SystemBroadcastMessage extends BaseMessage {
	type: 'SYSTEM_BROADCAST';
	payload: {
		message: string;
		level: 'info' | 'warning' | 'error';
	};
}

export interface HeartbeatMessage extends BaseMessage {
	type: 'HEARTBEAT';
	payload: Record<string, never>;
}

// Union type of all possible messages
export type WebSocketMessage =
	| QuestStartMessage
	| QuestProgressMessage
	| QuestCompleteMessage
	| QuestCompletedMessage
	| ArenaInitiateMessage
	| ArenaMatchFoundMessage
	| ArenaCombatResultMessage
	| AuctionBidMessage
	| AuctionSoldMessage
	| LeaderboardUpdateMessage
	| SystemBroadcastMessage
	| HeartbeatMessage;

// Type guard
export function isWebSocketMessage(data: unknown): data is WebSocketMessage {
	return (
		typeof data === 'object' &&
		data !== null &&
		'type' in data &&
		'timestamp' in data &&
		typeof (data as BaseMessage).type === 'string'
	);
}
