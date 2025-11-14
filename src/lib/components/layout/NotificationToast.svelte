<script lang="ts">
	/**
	 * NotificationToast Component
	 * Toast notifications for game events
	 */
	import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';

	interface Props {
		message: string;
		type?: 'success' | 'error' | 'info';
		duration?: number;
		onClose?: () => void;
		show?: boolean;
	}

	let {
		message,
		type = 'info',
		duration = 3000,
		onClose,
		show = $bindable(true)
	}: Props = $props();

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info
	};

	const colors = {
		success: {
			bg: 'bg-arcana-green-900/40',
			border: 'border-arcana-green-500/50',
			text: 'text-arcana-green-400',
			icon: 'text-arcana-green-400'
		},
		error: {
			bg: 'bg-arcana-orange-900/40',
			border: 'border-arcana-orange-500/50',
			text: 'text-arcana-orange-400',
			icon: 'text-arcana-orange-400'
		},
		info: {
			bg: 'bg-arcana-cyan-900/40',
			border: 'border-arcana-cyan-500/50',
			text: 'text-arcana-cyan-400',
			icon: 'text-arcana-cyan-400'
		}
	};

	const Icon = $derived(icons[type]);
	const colorScheme = $derived(colors[type]);

	$effect(() => {
		if (show && duration > 0) {
			const timer = setTimeout(() => {
				show = false;
				onClose?.();
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	function handleClose() {
		show = false;
		onClose?.();
	}
</script>

{#if show}
	<div
		class="fixed top-4 right-4 z-50 max-w-sm w-full animate-slideIn"
		role="alert"
	>
		<div
			class="flex items-start gap-3 p-4 rounded-xl border {colorScheme.bg} {colorScheme.border} backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-arcana-bg-elevated/80"
		>
			<Icon size={20} class={colorScheme.icon} />
			<p class="flex-1 text-sm {colorScheme.text}">{message}</p>
			<button
				onclick={handleClose}
				class="text-arcana-text-muted hover:text-arcana-text-primary transition-colors"
			>
				<X size={16} />
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.animate-slideIn {
		animation: slideIn 0.3s ease-out;
	}
</style>
