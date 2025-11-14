/**
 * Redis Pub/Sub for WebSocket Communication
 * Enables broadcasting messages across multiple server instances
 */

import Redis from 'ioredis';

const REDIS_CONFIG = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD || undefined,
	db: parseInt(process.env.REDIS_DB || '0')
};

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

/**
 * Get or create Redis publisher
 */
export function getPublisher(): Redis {
	if (publisher) {
		return publisher;
	}

	publisher = new Redis(REDIS_CONFIG);

	publisher.on('connect', () => {
		console.log('✅ Redis Publisher connected');
	});

	publisher.on('error', (error) => {
		console.error('❌ Redis Publisher error:', error);
	});

	return publisher;
}

/**
 * Get or create Redis subscriber
 */
export function getSubscriber(): Redis {
	if (subscriber) {
		return subscriber;
	}

	subscriber = new Redis(REDIS_CONFIG);

	subscriber.on('connect', () => {
		console.log('✅ Redis Subscriber connected');
	});

	subscriber.on('error', (error) => {
		console.error('❌ Redis Subscriber error:', error);
	});

	return subscriber;
}

/**
 * Channel names for different event types
 */
export const CHANNELS = {
	QUEST_EVENTS: 'quest:events',
	ARENA_EVENTS: 'arena:events',
	AUCTION_EVENTS: 'auction:events',
	LEADERBOARD_UPDATES: 'leaderboard:updates',
	BROADCAST: 'broadcast:all'
} as const;

/**
 * Publish a message to a channel
 */
export async function publish(channel: string, message: object): Promise<void> {
	const pub = getPublisher();
	await pub.publish(channel, JSON.stringify(message));
}

/**
 * Subscribe to a channel
 */
export async function subscribe(
	channel: string,
	callback: (message: unknown) => void
): Promise<void> {
	const sub = getSubscriber();

	sub.on('message', (ch, msg) => {
		if (ch === channel) {
			try {
				const data = JSON.parse(msg);
				callback(data);
			} catch (error) {
				console.error('Failed to parse message:', error);
			}
		}
	});

	await sub.subscribe(channel);
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: string): Promise<void> {
	const sub = getSubscriber();
	await sub.unsubscribe(channel);
}

/**
 * Close Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
	if (publisher) {
		await publisher.quit();
		publisher = null;
	}

	if (subscriber) {
		await subscriber.quit();
		subscriber = null;
	}

	console.log('✅ Redis Pub/Sub connections closed');
}
