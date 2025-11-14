<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title: string;
		content: string[];
		onClose: () => void;
		autoAdvance?: boolean;
		advanceDelay?: number;
	}

	let { title, content, onClose, autoAdvance = false, advanceDelay = 3000 }: Props = $props();

	let currentPage = $state(0);
	let isVisible = $state(true);

	const handleNext = () => {
		if (currentPage < content.length - 1) {
			currentPage++;
		} else {
			handleClose();
		}
	};

	const handlePrevious = () => {
		if (currentPage > 0) {
			currentPage--;
		}
	};

	const handleClose = () => {
		isVisible = false;
		setTimeout(onClose, 300); // Wait for fade out animation
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			handleClose();
		} else if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
			handleNext();
		} else if (event.key === 'ArrowLeft') {
			handlePrevious();
		}
	};

	// Auto-advance functionality
	$effect(() => {
		if (autoAdvance && currentPage < content.length - 1) {
			const timer = setTimeout(() => {
				handleNext();
			}, advanceDelay);

			return () => clearTimeout(timer);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="narrative-overlay" class:visible={isVisible} onclick={handleClose} role="presentation">
	<Card
		variant="glass"
		class="narrative-modal"
		class:visible={isVisible}
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="narrative-title"
	>
		<!-- Title -->
		<div class="narrative-header">
			<h2 id="narrative-title" class="narrative-title">{title}</h2>
			<button class="close-button" onclick={handleClose} aria-label="Close">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="narrative-content">
			<div class="narrative-text">
				{@html content[currentPage]}
			</div>
		</div>

		<!-- Footer -->
		<div class="narrative-footer">
			<!-- Page Indicator -->
			<div class="page-indicator">
				{#each content as _, index}
					<button
						class="page-dot"
						class:active={index === currentPage}
						onclick={() => (currentPage = index)}
						aria-label={`Go to page ${index + 1}`}
					></button>
				{/each}
			</div>

			<!-- Navigation Buttons -->
			<div class="navigation-buttons">
				{#if currentPage > 0}
					<Button variant="secondary" size="sm" onclick={handlePrevious}>Previous</Button>
				{/if}

				{#if currentPage < content.length - 1}
					<Button variant="primary" size="sm" onclick={handleNext}>Next</Button>
				{:else}
					<Button variant="primary" size="sm" onclick={handleClose}>Begin Adventure</Button>
				{/if}
			</div>
		</div>
	</Card>
</div>

<style>
	.narrative-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.narrative-overlay.visible {
		opacity: 1;
	}

	.narrative-modal {
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transform: scale(0.9);
		opacity: 0;
		transition: all 0.3s ease;
	}

	.narrative-modal.visible {
		transform: scale(1);
		opacity: 1;
	}

	.narrative-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem;
		border-bottom: 1px solid var(--color-gray-6);
	}

	.narrative-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-primary-12);
		margin: 0;
		font-family: serif;
	}

	.close-button {
		background: none;
		border: none;
		color: var(--color-gray-11);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: var(--color-gray-4);
		color: var(--color-gray-12);
	}

	.narrative-content {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
	}

	.narrative-text {
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-gray-12);
		font-family: serif;
	}

	.narrative-text :global(p) {
		margin-bottom: 1.5rem;
	}

	.narrative-text :global(em) {
		font-style: italic;
		color: var(--color-primary-11);
	}

	.narrative-text :global(strong) {
		font-weight: 700;
		color: var(--color-primary-12);
	}

	.narrative-footer {
		padding: 1.5rem 2rem;
		border-top: 1px solid var(--color-gray-6);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.page-indicator {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.page-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-gray-6);
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0;
	}

	.page-dot:hover {
		background: var(--color-gray-8);
	}

	.page-dot.active {
		background: var(--color-primary-9);
		width: 1.5rem;
		border-radius: 0.25rem;
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.navigation-buttons :global(button) {
		min-width: 120px;
	}

	@media (max-width: 640px) {
		.narrative-title {
			font-size: 1.5rem;
		}

		.narrative-text {
			font-size: 1rem;
		}

		.navigation-buttons {
			flex-direction: column;
		}

		.navigation-buttons :global(button) {
			width: 100%;
		}
	}
</style>
