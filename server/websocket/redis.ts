/**
 * Redis Pub/Sub for WebSocket Communication
 * Enables broadcasting messages across multiple server instances
 *
 * Note: Redis is optional for MVP. If not available, pub/sub features
 * will be disabled but the app will continue to work.
 */

import Redis from 'ioredis';

const REDIS_CONFIG = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD || undefined,
	db: parseInt(process.env.REDIS_DB || '0'),
	maxRetriesPerRequest: 1, // Fail fast if Redis is not available
	retryStrategy: () => null, // Don't retry, just fail
	lazyConnect: true, // Don't connect immediately
	enableOfflineQueue: false // Don't queue commands when offline
};

let publisher: Redis | null = null;
let subscriber: Redis | null = null;
let redisAvailable = false;
let connectionAttempted = false;

/**
 * Check if Redis is available
 */
async function checkRedisAvailable(): Promise<boolean> {
	if (connectionAttempted) {
		return redisAvailable;
	}

	connectionAttempted = true;

	try {
		const testClient = new Redis(REDIS_CONFIG);
		await testClient.connect();
		await testClient.ping();
		await testClient.quit();
		redisAvailable = true;
		console.log('✅ Redis is available');
	} catch (error) {
		redisAvailable = false;
		console.warn('⚠️  Redis not available - running without pub/sub features (MVP mode)');
	}

	return redisAvailable;
}

/**
 * Get or create Redis publisher
 */
export async function getPublisher(): Promise<Redis | null> {
	const available = await checkRedisAvailable();
	if (!available) {
		return null;
	}

	if (publisher) {
		return publisher;
	}

	publisher = new Redis(REDIS_CONFIG);
	await publisher.connect();

	publisher.on('connect', () => {
		console.log('✅ Redis Publisher connected');
	});

	publisher.on('error', (error) => {
		console.error('❌ Redis Publisher error:', error.message);
	});

	return publisher;
}

/**
 * Get or create Redis subscriber
 */
export async function getSubscriber(): Promise<Redis | null> {
	const available = await checkRedisAvailable();
	if (!available) {
		return null;
	}

	if (subscriber) {
		return subscriber;
	}

	subscriber = new Redis(REDIS_CONFIG);
	await subscriber.connect();

	subscriber.on('connect', () => {
		console.log('✅ Redis Subscriber connected');
	});

	subscriber.on('error', (error) => {
		console.error('❌ Redis Subscriber error:', error.message);
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
	const pub = await getPublisher();
	if (!pub) {
		// Redis not available - skip pub/sub (MVP mode)
		return;
	}
	await pub.publish(channel, JSON.stringify(message));
}

/**
 * Subscribe to a channel
 */
export async function subscribe(
	channel: string,
	callback: (message: unknown) => void
): Promise<void> {
	const sub = await getSubscriber();
	if (!sub) {
		// Redis not available - skip pub/sub (MVP mode)
		return;
	}

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
	const sub = await getSubscriber();
	if (!sub) {
		// Redis not available - nothing to unsubscribe
		return;
	}
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
