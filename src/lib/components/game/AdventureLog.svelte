<script lang="ts">
	/**
	 * AdventureLog Component
	 * Displays a scrollable log of adventure messages with color-coded types
	 */

	interface LogMessage {
		text: string;
		type: 'danger' | 'success' | 'gold' | 'xp' | 'normal';
	}

	interface Props {
		messages: LogMessage[];
		title?: string;
		maxHeight?: string;
		class?: string;
	}

	let {
		messages,
		title = 'Adventure Log',
		maxHeight = 'max-h-64',
		class: className = ''
	}: Props = $props();

	const messageColors: Record<LogMessage['type'], string> = {
		danger: 'text-arcana-orange-600',
		success: 'text-arcana-green-500',
		gold: 'text-arcana-gold-400',
		xp: 'text-arcana-cyan-500',
		normal: 'text-arcana-text-primary'
	};
</script>

<div class={className}>
	<h3 class="text-xl font-serif text-arcana-gold-400 mb-4">{title}</h3>
	<div class="space-y-2 {maxHeight} overflow-y-auto scrollbar-thin scrollbar-track-arcana-bg-primary scrollbar-thumb-arcana-border-default">
		{#if messages.length === 0}
			<p class="text-sm text-arcana-text-muted italic">No messages yet...</p>
		{:else}
			{#each messages as message, index (index)}
				<div class="text-sm {messageColors[message.type]} leading-relaxed animate-slideIn">
					{'>'} {message.text}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.animate-slideIn {
		animation: slideIn 0.3s ease-out;
	}

	/* Custom scrollbar */
	.scrollbar-thin::-webkit-scrollbar {
		width: 8px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: rgba(26, 29, 46, 0.5);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: rgba(61, 66, 102, 0.8);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: rgba(93, 106, 184, 0.8);
	}
</style>
