<script lang="ts">
	/**
	 * NavigationHeader Component
	 * Dark Fantasy navigation with character quick info
	 */
	import { goto } from '$app/navigation';
	import { Menu, X, Home, Sword, User, LogOut } from 'lucide-svelte';

	interface Props {
		characterName?: string;
		characterLevel?: number;
		characterHP?: number;
		characterMaxHP?: number;
		characterGold?: number;
	}

	let {
		characterName,
		characterLevel,
		characterHP,
		characterMaxHP,
		characterGold
	}: Props = $props();

	let mobileMenuOpen = $state(false);

	const navItems = [
		{ label: 'Home', href: '/', icon: Home },
		{ label: 'Dungeon', href: '/dungeon', icon: Sword },
		{ label: 'Character', href: '/character', icon: User }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function handleLogout() {
		// TODO: Implement logout
		goto('/auth/login');
	}
</script>

<nav class="bg-arcana-bg-secondary border-b border-arcana-border-default">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="text-2xl font-serif text-arcana-gold-400 hover:text-arcana-gold-300 transition-colors">
					Grindolia
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-4">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-arcana-text-primary hover:bg-arcana-bg-elevated hover:text-arcana-gold-400 transition-all"
					>
						<item.icon size={18} />
						{item.label}
					</a>
				{/each}

				{#if characterName}
					<!-- Character Quick Info -->
					<div class="flex items-center gap-3 ml-4 pl-4 border-l border-arcana-border-default">
						<div class="text-right">
							<div class="text-sm font-semibold text-arcana-text-primary">{characterName}</div>
							<div class="text-xs text-arcana-text-muted">
								Lvl {characterLevel} • {characterGold}g
							</div>
						</div>
						<div class="w-16">
							<div class="text-xs text-arcana-text-muted mb-1">HP</div>
							<div class="w-full bg-black/30 rounded-full h-2">
								<div
									class="bg-gradient-to-r from-arcana-orange-600 to-arcana-orange-500 h-2 rounded-full transition-all"
									style="width: {((characterHP || 0) / (characterMaxHP || 1)) * 100}%"
								/>
							</div>
						</div>
					</div>

					<!-- Logout Button -->
					<button
						onclick={handleLogout}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-arcana-text-secondary hover:bg-arcana-bg-elevated hover:text-arcana-orange-600 transition-all"
					>
						<LogOut size={18} />
					</button>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden flex items-center">
				<button
					onclick={toggleMobileMenu}
					class="text-arcana-text-primary hover:text-arcana-gold-400 transition-colors"
				>
					{#if mobileMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="md:hidden py-4 space-y-2 border-t border-arcana-border-default">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-arcana-text-primary hover:bg-arcana-bg-elevated hover:text-arcana-gold-400 transition-all"
						onclick={() => (mobileMenuOpen = false)}
					>
						<item.icon size={18} />
						{item.label}
					</a>
				{/each}

				{#if characterName}
					<div class="px-3 py-2 border-t border-arcana-border-default mt-2 pt-4">
						<div class="text-sm font-semibold text-arcana-text-primary mb-2">{characterName}</div>
						<div class="text-xs text-arcana-text-muted mb-2">
							Level {characterLevel} • {characterGold} Gold
						</div>
						<div class="mb-2">
							<div class="text-xs text-arcana-text-muted mb-1">HP: {characterHP} / {characterMaxHP}</div>
							<div class="w-full bg-black/30 rounded-full h-2">
								<div
									class="bg-gradient-to-r from-arcana-orange-600 to-arcana-orange-500 h-2 rounded-full transition-all"
									style="width: {((characterHP || 0) / (characterMaxHP || 1)) * 100}%"
								/>
							</div>
						</div>
					</div>

					<button
						onclick={handleLogout}
						class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-arcana-text-secondary hover:bg-arcana-bg-elevated hover:text-arcana-orange-600 transition-all"
					>
						<LogOut size={18} />
						Logout
					</button>
				{/if}
			</div>
		{/if}
	</div>
</nav>
