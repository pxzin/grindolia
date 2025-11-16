<script lang="ts">
	/**
	 * CombatArena Component
	 * Dark Fantasy combat encounter with combatant displays
	 */

	import { combatStore } from '$lib/stores/combat.svelte';
	import { dungeonStore } from '$lib/stores/dungeon.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CombatantCard from '$lib/components/game/CombatantCard.svelte';
	import CombatLog from '$lib/components/game/CombatLog.svelte';
	import VictoryModal from '$lib/components/ui/VictoryModal.svelte';
	import DefeatModal from '$lib/components/ui/DefeatModal.svelte';

	interface Props {
		characterId: number;
		characterName: string;
		characterHP: number;
		characterMaxHP: number;
	}

	let { characterId, characterName, characterHP, characterMaxHP }: Props = $props();

	const combat = combatStore.state;
	let isResolving = $state(false);
	let showVictory = $state(false);
	let showDefeat = $state(false);
	let combatMessages = $state<Array<{ text: string; type: any }>>([
		{ text: 'Combat begins! Prepare yourself!', type: 'normal' }
	]);

	async function fightMonster() {
		if (!dungeonStore.state.dungeonProgressId) return;

		isResolving = true;
		addMessage('You attack!', 'player');

		try {
			await combatStore.resolveCombat(characterId, dungeonStore.state.dungeonProgressId);

			// Show appropriate modal based on outcome
			if (combatStore.characterWon) {
				dungeonStore.monsterDefeated();
				addMessage('Victory! The monster falls!', 'critical');
				setTimeout(() => {
					showVictory = true;
				}, 500);
			} else {
				addMessage('You have been defeated...', 'damage');
				setTimeout(() => {
					showDefeat = true;
				}, 500);
			}
		} catch (error) {
			console.error('Combat failed:', error);
			addMessage('Combat error occurred!', 'damage');
		} finally {
			isResolving = false;
		}
	}

	function addMessage(text: string, type: any) {
		combatMessages = [...combatMessages, { text, type }].slice(-10);
	}

	function handleVictoryContinue() {
		showVictory = false;
		combatStore.endCombat();
	}

	function handleDefeatRespawn() {
		showDefeat = false;
		combatStore.endCombat();
		dungeonStore.exitDungeon();
	}

	// Derive monster data from combat state
	const monster = $derived({
		name: combat.monster?.name || 'Unknown',
		level: combat.monster?.level || 1,
		hp: { current: combat.monsterHPCurrent, max: combat.monsterHPStart },
		attack: combat.monster?.strength || 10,
		defense: combat.monster?.dexterity || 10
	});

	const player = $derived({
		name: characterName,
		level: 1, // Will be passed from parent
		hp: { current: combat.characterHPCurrent || characterHP, max: characterMaxHP },
		attack: 10, // Character stats from parent
		defense: 10
	});

	// Get rewards from combat state
	const rewards = $derived(combat.rewards);
</script>

<div class="space-y-6">
	<!-- Combat Header -->
	<Card variant="elevated">
		<h2 class="text-2xl font-serif text-arcana-gold-400 text-center">Combat Arena</h2>
	</Card>

	<!-- Combatants Display -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Player Card -->
		<CombatantCard
			name={player.name}
			level={player.level}
			type="player"
			hp={player.hp}
			attack={player.attack}
			defense={player.defense}
			className="warrior"
		/>

		<!-- Monster Card -->
		<CombatantCard
			name={monster.name}
			level={monster.level}
			type="monster"
			hp={monster.hp}
			attack={monster.attack}
			defense={monster.defense}
		/>
	</div>

	<!-- Combat Log -->
	<Card>
		<CombatLog messages={combatMessages} />
	</Card>

	<!-- Action Buttons -->
	{#if !combatStore.isFinished}
		<div class="grid grid-cols-2 gap-4">
			<Button
				variant="primary"
				size="lg"
				class="w-full"
				onclick={fightMonster}
				disabled={isResolving}
			>
				{isResolving ? 'Fighting...' : 'Attack'}
			</Button>
			<Button
				variant="secondary"
				size="lg"
				class="w-full"
				onclick={() => combatStore.endCombat()}
				disabled={isResolving}
			>
				Flee
			</Button>
		</div>
	{:else}
		<Card variant="elevated">
			<p class="text-center text-arcana-text-primary">
				Combat ended. {combatStore.characterWon ? 'Victory!' : 'Defeat...'}
			</p>
		</Card>
	{/if}
</div>

<!-- Victory Modal -->
<VictoryModal
	bind:open={showVictory}
	xpGained={rewards?.xp || 0}
	goldGained={rewards?.currency || 0}
	onContinue={handleVictoryContinue}
/>

<!-- Defeat Modal -->
<DefeatModal bind:open={showDefeat} onRespawn={handleDefeatRespawn} />
