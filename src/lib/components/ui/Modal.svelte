<script lang="ts">
	/**
	 * Modal Component
	 * Full-screen overlay modal with backdrop blur
	 */

	interface Props {
		open?: boolean;
		onClose?: () => void;
		children?: any;
		class?: string;
		closeOnBackdrop?: boolean;
	}

	let {
		open = $bindable(false),
		onClose,
		children,
		class: className = '',
		closeOnBackdrop = true
	}: Props = $props();

	function handleBackdropClick() {
		if (closeOnBackdrop && onClose) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && onClose) {
			onClose();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 bg-arcana-bg-primary/95 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="{className}" onclick={(e) => e.stopPropagation()} role="document">
			{@render children?.()}
		</div>
	</div>
{/if}

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
