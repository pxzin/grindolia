/**
 * WebSocket Store
 * Manages WebSocket connection state using Svelte 5 runes
 */

import type { WebSocketMessage } from '$lib/types/websocket';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketState {
	status: ConnectionStatus;
	error: string | null;
	lastHeartbeat: number | null;
}

class WebSocketStore {
	private _state = $state<WebSocketState>({
		status: 'disconnected',
		error: null,
		lastHeartbeat: null
	});

	private ws: WebSocket | null = null;
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second

	private messageHandlers = new Map<string, Set<(payload: unknown) => void>>();

	/**
	 * Get current state (readonly)
	 */
	get state(): Readonly<WebSocketState> {
		return this._state;
	}

	/**
	 * Check if connected
	 */
	get isConnected(): boolean {
		return this._state.status === 'connected';
	}

	/**
	 * Connect to WebSocket server
	 */
	connect(url: string): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			console.log('WebSocket already connected');
			return;
		}

		this._state.status = 'connecting';
		this._state.error = null;

		try {
			this.ws = new WebSocket(url);

			this.ws.onopen = () => {
				console.log('✅ WebSocket connected');
				this._state.status = 'connected';
				this._state.error = null;
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;
				this.startHeartbeat();
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
				this._state.status = 'error';
				this._state.error = 'Connection error';
			};

			this.ws.onclose = () => {
				console.log('❌ WebSocket disconnected');
				this._state.status = 'disconnected';
				this.stopHeartbeat();
				this.attemptReconnect(url);
			};
		} catch (error) {
			console.error('Failed to create WebSocket connection:', error);
			this._state.status = 'error';
			this._state.error = 'Failed to connect';
		}
	}

	/**
	 * Disconnect from WebSocket server
	 */
	disconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		this.stopHeartbeat();

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		this._state.status = 'disconnected';
		this._state.error = null;
		this.reconnectAttempts = 0;
	}

	/**
	 * Send message to server
	 */
	send(message: WebSocketMessage): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.warn('WebSocket not connected, cannot send message');
			return;
		}

		try {
			this.ws.send(JSON.stringify(message));
		} catch (error) {
			console.error('Failed to send WebSocket message:', error);
		}
	}

	/**
	 * Subscribe to messages of a specific type
	 */
	on(type: string, handler: (payload: unknown) => void): () => void {
		if (!this.messageHandlers.has(type)) {
			this.messageHandlers.set(type, new Set());
		}

		this.messageHandlers.get(type)!.add(handler);

		// Return unsubscribe function
		return () => {
			const handlers = this.messageHandlers.get(type);
			if (handlers) {
				handlers.delete(handler);
				if (handlers.size === 0) {
					this.messageHandlers.delete(type);
				}
			}
		};
	}

	/**
	 * Handle incoming message
	 */
	private handleMessage(message: WebSocketMessage): void {
		// Update heartbeat timestamp
		if (message.type === 'HEARTBEAT') {
			this._state.lastHeartbeat = Date.now();
			return;
		}

		// Call registered handlers
		const handlers = this.messageHandlers.get(message.type);
		if (handlers) {
			handlers.forEach(handler => {
				try {
					handler(message.payload);
				} catch (error) {
					console.error(`Error in message handler for ${message.type}:`, error);
				}
			});
		}
	}

	/**
	 * Start heartbeat interval
	 */
	private startHeartbeat(): void {
		this.stopHeartbeat();

		this.heartbeatInterval = setInterval(() => {
			this.send({
				type: 'HEARTBEAT',
				timestamp: Date.now(),
				payload: {}
			});
		}, 30000); // Send heartbeat every 30 seconds
	}

	/**
	 * Stop heartbeat interval
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	/**
	 * Attempt to reconnect
	 */
	private attemptReconnect(url: string): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnect attempts reached');
			this._state.error = 'Failed to reconnect';
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

		console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

		this.reconnectTimeout = setTimeout(() => {
			console.log('Attempting to reconnect...');
			this.connect(url);
		}, delay);
	}
}

// Export singleton instance
export const websocketStore = new WebSocketStore();
