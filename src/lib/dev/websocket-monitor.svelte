<script lang="ts">
	/**
	 * WebSocket Monitor Component
	 * Monitor WebSocket connections and messages
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Wifi, WifiOff, Trash2 } from 'lucide-svelte';

	interface WebSocketMessage {
		id: string;
		timestamp: number;
		direction: 'sent' | 'received';
		type: string;
		data: any;
	}

	let isConnected = $state(false);
	let messages = $state<WebSocketMessage[]>([]);
	let messageId = 0;

	// Monitor WebSocket if available
	if (typeof window !== 'undefined' && import.meta.env.DEV) {
		// Intercept WebSocket constructor
		const OriginalWebSocket = window.WebSocket;
		window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
			const ws = new OriginalWebSocket(url, protocols);

			ws.addEventListener('open', () => {
				isConnected = true;
				addMessage('system', 'connected', { url: url.toString() });
			});

			ws.addEventListener('close', () => {
				isConnected = false;
				addMessage('system', 'disconnected', {});
			});

			ws.addEventListener('message', (event) => {
				try {
					const data = JSON.parse(event.data);
					addMessage('received', data.type || 'unknown', data);
				} catch {
					addMessage('received', 'raw', event.data);
				}
			});

			// Intercept send
			const originalSend = ws.send.bind(ws);
			ws.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
				try {
					const parsed = typeof data === 'string' ? JSON.parse(data) : data;
					addMessage('sent', parsed.type || 'unknown', parsed);
				} catch {
					addMessage('sent', 'raw', data);
				}
				return originalSend(data);
			};

			return ws;
		} as any;
	}

	function addMessage(direction: 'sent' | 'received' | 'system', type: string, data: any) {
		messages = [
			{
				id: `msg-${messageId++}`,
				timestamp: Date.now(),
				direction: direction as 'sent' | 'received',
				type,
				data
			},
			...messages
		].slice(0, 50); // Keep last 50 messages
	}

	function clearMessages() {
		messages = [];
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}
</script>

{#if import.meta.env.DEV}
	<Card variant="elevated" class="mb-4">
		<div class="p-4">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-serif text-arcana-text-primary flex items-center gap-2">
					{#if isConnected}
						<Wifi size={20} class="text-arcana-green-500" />
					{:else}
						<WifiOff size={20} class="text-arcana-text-muted" />
					{/if}
					WebSocket Monitor
				</h3>
				<div class="flex items-center gap-2">
					<span class="text-xs text-arcana-text-muted">{messages.length} messages</span>
					<Button variant="secondary" size="sm" onclick={clearMessages}>
						<Trash2 size={14} />
					</Button>
				</div>
			</div>

			<!-- Status -->
			<div class="mb-4 p-2 rounded bg-arcana-bg-elevated">
				<div class="text-xs">
					<span class="text-arcana-text-muted">Status:</span>
					<span
						class="ml-2 {isConnected ? 'text-arcana-green-500' : 'text-arcana-text-muted'}"
					>
						{isConnected ? 'Connected' : 'Disconnected'}
					</span>
				</div>
			</div>

			<!-- Messages -->
			<div class="max-h-96 overflow-y-auto space-y-2">
				{#each messages as message (message.id)}
					<div
						class="p-3 rounded border {message.direction === 'sent'
							? 'bg-arcana-cyan-900/20 border-arcana-cyan-600/30'
							: 'bg-arcana-bg-elevated border-arcana-border-default'}"
					>
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center gap-2">
								<span
									class="text-xs px-2 py-0.5 rounded {message.direction === 'sent'
										? 'bg-arcana-cyan-600/30 text-arcana-cyan-400'
										: 'bg-arcana-bg-primary text-arcana-text-secondary'}"
								>
									{message.direction === 'sent' ? '→' : '←'} {message.type}
								</span>
							</div>
							<span class="text-xs text-arcana-text-muted">{formatTime(message.timestamp)}</span>
						</div>
						<pre
							class="text-xs text-arcana-text-primary overflow-x-auto bg-arcana-bg-primary p-2 rounded">{JSON.stringify(message.data, null, 2)}</pre>
					</div>
				{:else}
					<p class="text-sm text-arcana-text-muted text-center py-8">No messages yet</p>
				{/each}
			</div>
		</div>
	</Card>
{/if}
