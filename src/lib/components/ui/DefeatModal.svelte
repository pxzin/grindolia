<script lang="ts">
	/**
	 * DefeatModal Component
	 * Modal shown when player loses a combat encounter
	 */
	import Modal from './Modal.svelte';
	import Card from './Card.svelte';
	import Button from './Button.svelte';
	import { Skull } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		onRespawn: () => void;
	}

	let { open = $bindable(false), onRespawn }: Props = $props();
</script>

<Modal bind:open closeOnBackdrop={false}>
	<Card variant="elevated" padding="lg" class="max-w-md w-full text-center border-2 border-arcana-orange-600/50">
		<div class="mb-6">
			<div
				class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-arcana-orange-600 to-arcana-orange-800 flex items-center justify-center shadow-[0_0_40px_rgba(255,107,53,0.6)] animate-pulse"
			>
				<Skull size={40} class="text-arcana-bg-primary" />
			</div>
			<h2
				class="text-4xl font-serif text-arcana-orange-600 mb-2 drop-shadow-[0_0_20px_rgba(255,107,53,0.6)]"
			>
				Defeated
			</h2>
			<p class="text-arcana-text-secondary leading-relaxed">
				The darkness has claimed you... but heroes never truly fall.
			</p>
		</div>

		<div class="bg-black/20 rounded-xl p-6 mb-8 border border-arcana-border-default">
			<p class="text-arcana-text-primary leading-relaxed">
				You will respawn at the dungeon entrance with your equipment intact, ready to challenge
				the depths once more.
			</p>
		</div>

		<Button variant="primary" onclick={onRespawn} class="w-full"> Return to Dungeon </Button>
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
