<script lang="ts">
	/**
	 * DungeonView Component
	 * Main dungeon exploration interface
	 */

	import { dungeonStore } from '$lib/stores/dungeon.svelte';
	import { combatStore } from '$lib/stores/combat.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		characterId: number;
	}

	let { characterId }: Props = $props();

	const dungeon = dungeonStore.state;
	const combat = combatStore.state;

	async function startCombat() {
		if (!dungeon.dungeonProgressId) return;

		try {
			await combatStore.initiateCombat(characterId, dungeon.dungeonProgressId);
		} catch (error) {
			console.error('Failed to start combat:', error);
		}
	}

	async function handleDescend() {
		try {
			await dungeonStore.descendFloor();
		} catch (error) {
			console.error('Failed to descend:', error);
		}
	}
</script>

<div class="dungeon-view">
	<Card variant="elevated" padding="lg">
		<!-- Dungeon Header -->
		<div class="mb-6">
			<h2 class="text-2xl font-bold text-gray-12">{dungeon.dungeonName}</h2>
			<p class="text-gray-11 mt-2">{dungeon.dungeonDescription}</p>
		</div>

		<!-- Floor Progress -->
		<div class="mb-6">
			<div class="flex justify-between items-center mb-2">
				<span class="text-gray-11 font-medium">Floor {dungeon.currentFloor} / {dungeon.maxFloors}</span>
				<span class="text-gray-11 text-sm">Difficulty: {dungeon.floorDifficulty.toFixed(1)}x</span>
			</div>
			<div class="w-full bg-gray-6 rounded-full h-3">
				<div
					class="bg-blue-9 h-3 rounded-full transition-all"
					style="width: {dungeonStore.floorProgress}%"
				></div>
			</div>
		</div>

		<!-- Combat Status -->
		{#if !combat.isInCombat}
			<div class="text-center py-8">
				<p class="text-gray-11 mb-4">A dark corridor stretches before you...</p>
				<Button onclick={startCombat} variant="primary" size="lg">
					Encounter Monster
				</Button>
			</div>
		{:else}
			<div class="text-center py-4">
				<p class="text-gray-11">Combat in progress...</p>
			</div>
		{/if}

		<!-- Floor Actions -->
		{#if dungeon.canDescend && !combat.isInCombat}
			<div class="mt-6 pt-6 border-t border-gray-6">
				<Button onclick={handleDescend} variant="primary" size="lg" class="w-full">
					{#if dungeonStore.isLastFloor}
						Complete Dungeon
					{:else}
						Descend to Floor {dungeon.currentFloor + 1}
					{/if}
				</Button>
			</div>
		{/if}

		<!-- Monsters Defeated Counter -->
		<div class="mt-4 text-center text-sm text-gray-11">
			Monsters defeated on this floor: {dungeon.monstersDefeated}
		</div>
	</Card>
</div>

<style>
	.dungeon-view {
		max-width: 48rem;
		margin: 0 auto;
	}
</style>
