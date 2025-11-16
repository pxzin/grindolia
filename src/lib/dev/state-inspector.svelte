<script lang="ts">
	/**
	 * State Inspector Component
	 * Inspect and monitor application state
	 */
	import { characterStore } from '$lib/stores/character.svelte';
	import { leaderboardStore } from '$lib/stores/leaderboard.svelte';
	import { i18nStore } from '$lib/stores/i18n.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Eye, RefreshCw, Copy, Check } from 'lucide-svelte';

	let selectedStore = $state<'character' | 'leaderboard' | 'i18n'>('character');
	let copied = $state(false);
	let refreshKey = $state(0);

	// Reactive state snapshots
	const characterState = $derived({
		character: characterStore.character,
		loading: characterStore.loading,
		error: characterStore.error
	});

	const leaderboardState = $derived({
		entries: leaderboardStore.entries.length + ' entries',
		category: leaderboardStore.category,
		playerRank: leaderboardStore.playerRank,
		loading: leaderboardStore.loading,
		error: leaderboardStore.error,
		lastUpdate: leaderboardStore.lastUpdate
	});

	const i18nState = $derived({
		currentLocale: i18nStore.currentLocale,
		isLoading: i18nStore.isLoading
	});

	const stateMap = {
		character: characterState,
		leaderboard: leaderboardState,
		i18n: i18nState
	};

	function refresh() {
		refreshKey++;
	}

	async function copyState() {
		const state = stateMap[selectedStore];
		try {
			await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

{#if import.meta.env.DEV}
	<Card variant="elevated">
		<div class="p-4">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-serif text-arcana-text-primary flex items-center gap-2">
					<Eye size={20} />
					State Inspector
				</h3>
				<div class="flex items-center gap-2">
					<Button variant="secondary" size="sm" onclick={copyState}>
						{#if copied}
							<Check size={14} class="text-arcana-green-500" />
						{:else}
							<Copy size={14} />
						{/if}
					</Button>
					<Button variant="secondary" size="sm" onclick={refresh}>
						<RefreshCw size={14} />
					</Button>
				</div>
			</div>

			<!-- Store Selector -->
			<div class="flex gap-2 mb-4">
				<button
					onclick={() => (selectedStore = 'character')}
					class="px-3 py-1 rounded text-sm {selectedStore === 'character'
						? 'bg-arcana-gold-600 text-arcana-bg-primary'
						: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
				>
					Character
				</button>
				<button
					onclick={() => (selectedStore = 'leaderboard')}
					class="px-3 py-1 rounded text-sm {selectedStore === 'leaderboard'
						? 'bg-arcana-gold-600 text-arcana-bg-primary'
						: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
				>
					Leaderboard
				</button>
				<button
					onclick={() => (selectedStore = 'i18n')}
					class="px-3 py-1 rounded text-sm {selectedStore === 'i18n'
						? 'bg-arcana-gold-600 text-arcana-bg-primary'
						: 'bg-arcana-bg-elevated text-arcana-text-secondary'}"
				>
					I18n
				</button>
			</div>

			<!-- State Display -->
			{#key refreshKey}
				<div class="max-h-96 overflow-y-auto">
					<pre
						class="text-xs text-arcana-text-primary bg-arcana-bg-primary p-4 rounded overflow-x-auto">{JSON.stringify(stateMap[selectedStore], null, 2)}</pre>
				</div>
			{/key}

			<!-- Footer -->
			<div class="mt-4 pt-4 border-t border-arcana-border-default">
				<p class="text-xs text-arcana-text-muted">
					Press the refresh button to update state, or copy to clipboard.
				</p>
			</div>
		</div>
	</Card>
{/if}
