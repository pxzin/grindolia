<script lang="ts">
	/**
	 * VictoryModal Component
	 * Modal shown when player wins a combat encounter
	 */
	import Modal from './Modal.svelte';
	import Card from './Card.svelte';
	import Button from './Button.svelte';
	import { Trophy, Coins, Zap } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		xpGained: number;
		goldGained: number;
		onContinue: () => void;
	}

	let { open = $bindable(false), xpGained, goldGained, onContinue }: Props = $props();
</script>

<Modal bind:open closeOnBackdrop={false}>
	<Card variant="gold" padding="lg" class="max-w-md w-full text-center">
		<div class="mb-6">
			<div
				class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-arcana-gold-600 to-arcana-gold-800 flex items-center justify-center shadow-[0_0_40px_rgba(201,152,74,0.6)] animate-pulse"
			>
				<Trophy size={40} class="text-arcana-bg-primary" />
			</div>
			<h2
				class="text-4xl font-serif text-arcana-gold-400 mb-2 drop-shadow-[0_0_20px_rgba(201,152,74,0.6)]"
			>
				Victory!
			</h2>
			<p class="text-arcana-text-secondary">You have defeated your foe!</p>
		</div>

		<div class="space-y-4 mb-8">
			<div class="bg-black/20 rounded-xl p-4 border border-arcana-cyan-600/30">
				<div class="flex items-center justify-center gap-3 mb-2">
					<Zap size={24} class="text-arcana-cyan-500" />
					<span class="text-lg text-arcana-text-secondary">Experience Gained</span>
				</div>
				<div class="text-3xl font-mono text-arcana-cyan-500">+{xpGained} XP</div>
			</div>

			<div class="bg-black/20 rounded-xl p-4 border border-arcana-gold-600/30">
				<div class="flex items-center justify-center gap-3 mb-2">
					<Coins size={24} class="text-arcana-gold-600" />
					<span class="text-lg text-arcana-text-secondary">Gold Earned</span>
				</div>
				<div class="text-3xl font-mono text-arcana-gold-400">+{goldGained} Gold</div>
			</div>
		</div>

		<Button variant="hero" onclick={onContinue} class="w-full"> Continue Adventure </Button>
	</Card>
</Modal>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
