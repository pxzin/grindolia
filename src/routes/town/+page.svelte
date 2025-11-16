<script lang="ts">
	/**
	 * Town Hall - Central Hub
	 * Main activity selection screen after character selection/creation
	 */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { characterStore } from '$lib/stores/character.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { Swords, Scroll, Trophy, User, LogOut, Map } from 'lucide-svelte';
	import { t } from 'svelte-i18n';

	// Get server-side data
	let { data } = $props<{ data: { characterId: number | null; userId: number } }>();

	const character = $derived(characterStore.character);
	let loading = $state(false);

	// Auto-load character from session if not in store
	onMount(async () => {
		if (!characterStore.isLoaded && data.characterId) {
			loading = true;
			await characterStore.loadCharacter(data.characterId);
			loading = false;
		} else if (!data.characterId) {
			// No character selected, redirect to selection
			goto('/character/select');
		}
	});

	interface Activity {
		id: string;
		title: string;
		description: string;
		icon: any;
		color: string;
		path: string;
		available: boolean;
	}

	const activities: Activity[] = [
		{
			id: 'dungeon',
			title: 'Dungeon Crawler',
			description: 'Explore dark dungeons, fight monsters, and collect treasure',
			icon: Map,
			color: '#C99A4A',
			path: '/dungeon',
			available: true
		},
		{
			id: 'quests',
			title: 'Quest Board',
			description: 'Accept quests and complete epic challenges',
			icon: Scroll,
			color: '#5D6AB8',
			path: '/quests',
			available: true
		},
		{
			id: 'arena',
			title: 'Arena',
			description: 'Test your skills against other players',
			icon: Swords,
			color: '#D97706',
			available: false
		},
		{
			id: 'leaderboard',
			title: 'Leaderboards',
			description: 'Compete for glory and climb the rankings',
			icon: Trophy,
			color: '#10B981',
			path: '/leaderboard',
			available: true
		},
		{
			id: 'character',
			title: 'Character Sheet',
			description: 'View and manage your character stats',
			icon: User,
			color: '#06B6D4',
			path: character ? `/character/${character.id}` : '/character/select',
			available: true
		}
	];

	function navigateToActivity(activity: Activity) {
		if (!activity.available) return;
		goto(activity.path);
	}

	function logout() {
		goto('/auth/logout');
	}

	function switchCharacter() {
		goto('/character/select');
	}
</script>

<svelte:head>
	<title>Town Hall - Grindolia</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-radial from-arcana-bg-primary via-arcana-bg-primary/95 to-arcana-bg-primary p-4 md:p-8"
>
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1
				class="text-6xl font-serif text-arcana-gold-400 mb-4 drop-shadow-[0_0_30px_rgba(201,154,74,0.5)]"
			>
				Town Hall
			</h1>
			{#if loading}
				<Skeleton variant="text" width="300px" class="mx-auto mb-2" />
				<Skeleton variant="text" width="200px" class="mx-auto" />
			{:else if character}
				<p class="text-2xl text-arcana-text-secondary mb-2">
					Welcome back, <span class="text-arcana-gold-400 font-serif">{character.name}</span>
				</p>
				<p class="text-sm text-arcana-text-muted">
					Level {character.level} {character.class} • {character.hp}/{character.maxHp} HP
				</p>
			{:else}
				<p class="text-xl text-arcana-text-secondary">Choose your adventure</p>
			{/if}
		</div>

		<!-- Activity Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			{#each activities as activity}
				<button
					onclick={() => navigateToActivity(activity)}
					disabled={!activity.available}
					class="text-left w-full"
				>
					<Card
						variant={activity.available ? 'elevated' : 'default'}
						class="h-full transition-all duration-300 {activity.available
							? 'hover:scale-105 cursor-pointer'
							: 'opacity-50 cursor-not-allowed'}"
					>
						<div class="p-6 flex flex-col h-full">
							<!-- Icon -->
							<div class="mb-4">
								<div
									class="w-16 h-16 rounded-full flex items-center justify-center"
									style="background: {activity.color}20"
								>
									<svelte:component
										this={activity.icon}
										size={32}
										style="color: {activity.color}"
									/>
								</div>
							</div>

							<!-- Title -->
							<h3 class="text-2xl font-serif text-arcana-gold-400 mb-3">
								{activity.title}
							</h3>

							<!-- Description -->
							<p class="text-sm text-arcana-text-secondary mb-4 flex-grow">
								{activity.description}
							</p>

							<!-- Status -->
							{#if !activity.available}
								<div
									class="text-xs text-arcana-text-muted bg-arcana-bg-primary rounded-lg px-3 py-2 text-center"
								>
									Coming Soon
								</div>
							{:else}
								<div class="text-xs text-arcana-gold-400 text-center">Click to enter →</div>
							{/if}
						</div>
					</Card>
				</button>
			{/each}
		</div>

		<!-- Character Actions -->
		<Card variant="default" class="mb-4">
			<div class="p-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
				<Button variant="secondary" onclick={switchCharacter} class="flex items-center gap-2">
					<User size={18} />
					Switch Character
				</Button>
				<Button variant="secondary" onclick={logout} class="flex items-center gap-2">
					<LogOut size={18} />
					Logout
				</Button>
			</div>
		</Card>

		<!-- Quick Stats (if character loaded) -->
		{#if character}
			<Card variant="gold">
				<div class="p-6">
					<h3 class="text-lg font-serif text-arcana-gold-400 mb-4 text-center">Quick Stats</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div class="text-center">
							<div class="text-xs text-arcana-text-muted mb-1">Level</div>
							<div class="text-2xl font-mono text-arcana-text-primary">{character.level}</div>
						</div>
						<div class="text-center">
							<div class="text-xs text-arcana-text-muted mb-1">Gold</div>
							<div class="text-2xl font-mono text-arcana-gold-400">{character.currency}</div>
						</div>
						<div class="text-center">
							<div class="text-xs text-arcana-text-muted mb-1">Experience</div>
							<div class="text-2xl font-mono text-arcana-text-primary">{character.xp}</div>
						</div>
						<div class="text-center">
							<div class="text-xs text-arcana-text-muted mb-1">Floor</div>
							<div class="text-2xl font-mono text-arcana-text-primary">
								{character.currentDungeonFloor || 0}
							</div>
						</div>
					</div>
				</div>
			</Card>
		{/if}
	</div>
</div>

<style>
	.bg-gradient-radial {
		background: radial-gradient(
			ellipse at center,
			var(--color-arcana-bg-primary),
			rgba(93, 106, 184, 0.05),
			var(--color-arcana-bg-primary)
		);
	}
</style>
