/**
 * WebSocket Client Service
 * Handles WebSocket connection from the client side
 */

import type { WebSocketMessage } from '../types/websocket';

export class WebSocketService {
	private ws: WebSocket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second
	private messageQueue: WebSocketMessage[] = [];
	private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

	constructor(private url: string) {}

	/**
	 * Connect to WebSocket server
	 */
	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(this.url);

				this.ws.onopen = () => {
					console.log('✅ WebSocket connected');
					this.reconnectAttempts = 0;
					this.reconnectDelay = 1000;

					// Send queued messages
					this.flushMessageQueue();

					resolve();
				};

				this.ws.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data) as WebSocketMessage;
						this.handleMessage(message);
					} catch (error) {
						console.error('Failed to parse WebSocket message:', error);
					}
				};

				this.ws.onerror = (error) => {
					console.error('WebSocket error:', error);
					reject(error);
				};

				this.ws.onclose = () => {
					console.log('❌ WebSocket disconnected');
					this.handleDisconnect();
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Handle incoming message
	 */
	private handleMessage(message: WebSocketMessage): void {
		const listeners = this.listeners.get(message.type);
		if (listeners) {
			listeners.forEach((callback) => callback(message));
		}

		// Also trigger wildcard listeners
		const wildcardListeners = this.listeners.get('*');
		if (wildcardListeners) {
			wildcardListeners.forEach((callback) => callback(message));
		}
	}

	/**
	 * Handle disconnection and attempt reconnect
	 */
	private handleDisconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			console.log(`Reconnecting in ${this.reconnectDelay}ms... (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

			setTimeout(() => {
				this.reconnectAttempts++;
				this.reconnectDelay *= 2; // Exponential backoff
				this.connect().catch(() => {
					// Will retry on next disconnect
				});
			}, this.reconnectDelay);
		} else {
			console.error('Max reconnect attempts reached');
		}
	}

	/**
	 * Send a message
	 */
	send(message: Omit<WebSocketMessage, 'timestamp'>): void {
		const fullMessage: WebSocketMessage = {
			...message,
			timestamp: Date.now()
		} as WebSocketMessage;

		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(fullMessage));
		} else {
			// Queue message for later
			this.messageQueue.push(fullMessage);
		}
	}

	/**
	 * Send queued messages
	 */
	private flushMessageQueue(): void {
		while (this.messageQueue.length > 0) {
			const message = this.messageQueue.shift();
			if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify(message));
			}
		}
	}

	/**
	 * Register a message listener
	 */
	on(type: string, callback: (message: WebSocketMessage) => void): () => void {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}

		this.listeners.get(type)!.add(callback);

		// Return unsubscribe function
		return () => {
			const listeners = this.listeners.get(type);
			if (listeners) {
				listeners.delete(callback);
			}
		};
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
	}

	/**
	 * Check if connected
	 */
	isConnected(): boolean {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}
}

// Singleton instance
let wsService: WebSocketService | null = null;

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(): WebSocketService {
	if (!wsService) {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const url = `${protocol}//${window.location.host}/api/websocket`;
		wsService = new WebSocketService(url);
	}
	return wsService;
}
