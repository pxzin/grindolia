<script lang="ts">
	/**
	 * CombatLog Component
	 * Displays combat messages with color-coded types for turns, damage, etc.
	 */

	interface CombatMessage {
		text: string;
		type: 'player' | 'enemy' | 'damage' | 'heal' | 'miss' | 'critical' | 'normal';
	}

	interface Props {
		messages: CombatMessage[];
		title?: string;
		minHeight?: string;
		class?: string;
	}

	let {
		messages,
		title = 'Combat Log',
		minHeight = 'min-h-[120px]',
		class: className = ''
	}: Props = $props();

	const messageColors: Record<CombatMessage['type'], string> = {
		player: 'text-arcana-cyan-500',
		enemy: 'text-arcana-orange-600',
		damage: 'text-arcana-orange-500',
		heal: 'text-arcana-green-500',
		miss: 'text-arcana-text-muted',
		critical: 'text-arcana-gold-400',
		normal: 'text-arcana-text-primary'
	};
</script>

<div class={className}>
	<h3 class="text-xl font-serif text-arcana-gold-400 mb-4">{title}</h3>
	<div class="space-y-2 {minHeight}">
		{#if messages.length === 0}
			<p class="text-sm text-arcana-text-muted italic">Waiting for combat to begin...</p>
		{:else}
			{#each messages as message, index (index)}
				<div class="text-sm {messageColors[message.type]} leading-relaxed animate-fadeIn">
					{'>'} {message.text}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out;
	}
</style>
