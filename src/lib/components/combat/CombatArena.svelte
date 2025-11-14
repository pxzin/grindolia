<script lang="ts">
	/**
	 * CombatArena Component
	 * Displays combat encounter and battle animation
	 */

	import { combatStore } from '$lib/stores/combat.svelte';
	import { dungeonStore } from '$lib/stores/dungeon.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		characterId: number;
		characterName: string;
		characterHP: number;
		characterMaxHP: number;
	}

	let { characterId, characterName, characterHP, characterMaxHP }: Props = $props();

	const combat = combatStore.state;
	let isResolving = $state(false);
	let showRewards = $state(false);

	async function fightMonster() {
		if (!dungeonStore.state.dungeonProgressId) return;

		isResolving = true;
		try {
			await combatStore.resolveCombat(characterId, dungeonStore.state.dungeonProgressId);

			// Show rewards if character won
			if (combatStore.characterWon) {
				dungeonStore.monsterDefeated();
				showRewards = true;
			}
		} catch (error) {
			console.error('Combat failed:', error);
		} finally {
			isResolving = false;
		}
	}

	function continueDungeon() {
		showRewards = false;
		combatStore.endCombat();
	}
</script>

<div class="combat-arena">
	<Card variant="elevated" padding="lg">
		<!-- Combat Header -->
		<div class="text-center mb-6">
			<h3 class="text-xl font-bold text-gray-12">Combat Encounter</h3>
		</div>

		{#if !combatStore.isFinished}
			<!-- Monster Display -->
			{#if combat.monster}
				<div class="monster-display mb-6 text-center">
					<div class="mb-4">
						<span class="text-2xl">👹</span>
					</div>
					<h4 class="text-lg font-semibold text-gray-12">{combat.monster.name}</h4>
					<p class="text-sm text-gray-11">Level {combat.monster.level}</p>

					<!-- Monster HP Bar -->
					<div class="mt-4">
						<div class="flex justify-between text-sm mb-1">
							<span class="text-gray-11">HP</span>
							<span class="text-gray-11">{combat.monsterHPCurrent} / {combat.monsterHPStart}</span>
						</div>
						<div class="w-full bg-gray-6 rounded-full h-3">
							<div
								class="bg-red-9 h-3 rounded-full transition-all"
								style="width: {combatStore.monsterHPPercentage}%"
							></div>
						</div>
					</div>
				</div>

				<!-- VS Divider -->
				<div class="text-center text-gray-11 font-bold mb-6">VS</div>

				<!-- Character Display -->
				<div class="character-display mb-6 text-center">
					<h4 class="text-lg font-semibold text-gray-12">{characterName}</h4>

					<!-- Character HP Bar -->
					<div class="mt-4">
						<div class="flex justify-between text-sm mb-1">
							<span class="text-gray-11">HP</span>
							<span class="text-gray-11">{combat.characterHPCurrent} / {combat.characterHPStart}</span>
						</div>
						<div class="w-full bg-gray-6 rounded-full h-3">
							<div
								class="bg-green-9 h-3 rounded-full transition-all"
								style="width: {combatStore.characterHPPercentage}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Combat Action -->
				<div class="text-center">
					<Button
						onclick={fightMonster}
						variant="danger"
						size="lg"
						disabled={isResolving}
					>
						{isResolving ? 'Fighting...' : 'Fight!'}
					</Button>
				</div>
			{/if}
		{:else}
			<!-- Combat Results -->
			<div class="combat-results text-center">
				{#if combatStore.characterWon}
					<div class="mb-4">
						<span class="text-4xl">🎉</span>
					</div>
					<h3 class="text-2xl font-bold text-green-11 mb-4">Victory!</h3>

					{#if showRewards && combat.rewards}
						<div class="rewards bg-gray-3 rounded-lg p-4 mb-6">
							<h4 class="font-semibold text-gray-12 mb-3">Rewards</h4>
							<div class="space-y-2 text-gray-11">
								<p>+ {combat.rewards.xp} XP</p>
								<p>+ {combat.rewards.currency} Gold</p>
								{#if combat.rewards.items.length > 0}
									<p>+ {combat.rewards.items.length} Item(s)</p>
								{/if}
							</div>
						</div>
					{/if}

					<Button onclick={continueDungeon} variant="primary" size="lg">
						Continue
					</Button>
				{:else}
					<div class="mb-4">
						<span class="text-4xl">💀</span>
					</div>
					<h3 class="text-2xl font-bold text-red-11 mb-4">Defeated</h3>
					<p class="text-gray-11 mb-6">You have been defeated by the {combat.monster?.name}...</p>

					<Button onclick={continueDungeon} variant="primary" size="lg">
						Return to Town
					</Button>
				{/if}
			</div>
		{/if}
	</Card>
</div>

<style>
	.combat-arena {
		max-width: 36rem;
		margin: 0 auto;
	}

	.monster-display,
	.character-display {
		padding: 1rem;
		border-radius: 0.5rem;
		background: rgba(0, 0, 0, 0.1);
	}
</style>
