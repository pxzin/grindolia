<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import VictoryModal from '$lib/components/ui/VictoryModal.svelte';
	import DefeatModal from '$lib/components/ui/DefeatModal.svelte';
	import StatDisplay from '$lib/components/ui/StatDisplay.svelte';
	import CharacterSheet from '$lib/components/game/CharacterSheet.svelte';
	import ClassCard from '$lib/components/game/ClassCard.svelte';
	import AdventureLog from '$lib/components/game/AdventureLog.svelte';
	import CombatLog from '$lib/components/game/CombatLog.svelte';
	import { Sword, Sparkles, Wind, Heart } from 'lucide-svelte';

	let textValue = $state('');
	let emailValue = $state('');
	let passwordValue = $state('');
	let showVictoryModal = $state(false);
	let showDefeatModal = $state(false);
	let selectedClass = $state<string | null>(null);

	// Mock log messages
	const adventureMessages = [
		{ text: 'You enter the dark dungeon. The air is thick with ancient magic...', type: 'normal' as const },
		{ text: 'A monster appears from the shadows!', type: 'danger' as const },
		{ text: 'You found a hidden chest containing 50 gold!', type: 'gold' as const },
		{ text: 'You gained 150 XP!', type: 'xp' as const },
		{ text: 'You discovered a secret passage!', type: 'success' as const }
	];

	const combatMessages = [
		{ text: 'Combat begins! You face a Shadow Beast!', type: 'normal' as const },
		{ text: 'You attack for 45 damage!', type: 'player' as const },
		{ text: 'Shadow Beast attacks for 30 damage!', type: 'enemy' as const },
		{ text: 'CRITICAL HIT! You deal 90 damage!', type: 'critical' as const },
		{ text: 'You healed for 25 HP!', type: 'heal' as const },
		{ text: 'Shadow Beast misses!', type: 'miss' as const }
	];

	// Mock character data
	const mockCharacter = {
		name: 'Aragorn',
		class: 'warrior',
		level: 12,
		hp: { current: 245, max: 250 },
		xp: { current: 1850, max: 2000 },
		stats: {
			strength: 45,
			intelligence: 28,
			dexterity: 32,
			vitality: 50
		},
		gold: 12450
	};

	// Character classes
	const classes = [
		{
			id: 'warrior',
			name: 'Warrior',
			description:
				'A fierce melee combatant with high strength and vitality. Masters of close-quarter combat.',
			icon: Sword,
			color: '#ff6b35',
			stats: { strength: 15, intelligence: 8, dexterity: 10, vitality: 14 }
		},
		{
			id: 'mage',
			name: 'Mage',
			description:
				'A wielder of arcane magic with devastating spells. High intelligence but fragile defenses.',
			icon: Sparkles,
			color: '#2a9d8f',
			stats: { strength: 6, intelligence: 16, dexterity: 9, vitality: 8 }
		},
		{
			id: 'rogue',
			name: 'Rogue',
			description:
				'A swift and cunning assassin. Excels in critical strikes and evasion with high dexterity.',
			icon: Wind,
			color: '#43a047',
			stats: { strength: 10, intelligence: 10, dexterity: 16, vitality: 10 }
		},
		{
			id: 'cleric',
			name: 'Cleric',
			description:
				'A holy warrior who can heal allies and smite foes. Balanced stats with divine magic.',
			icon: Heart,
			color: '#d946ef',
			stats: { strength: 11, intelligence: 13, dexterity: 8, vitality: 12 }
		}
	];
</script>

<div class="min-h-screen bg-gray-1 p-8">
	<div class="max-w-7xl mx-auto">
		<header class="mb-12">
			<h1 class="text-4xl font-bold mb-2">Grindolia Design System</h1>
			<p class="text-gray-11">Componentes base do sistema de design</p>
		</header>

		<!-- Button Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Button</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Variantes</h3>
				<div class="flex gap-3 flex-wrap">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="danger">Danger</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Hero Variant</h3>
				<p class="text-sm text-gray-11 mb-4">
					Variante especial para CTAs principais com fonte Cinzel (serif) e efeito de brilho dourado
				</p>
				<div class="flex gap-3 flex-wrap">
					<Button variant="hero">Enter the Dungeon</Button>
					<Button variant="hero" size="lg">Begin Your Adventure</Button>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Tamanhos</h3>
				<div class="flex gap-3 items-center flex-wrap">
					<Button variant="primary" size="sm">Small</Button>
					<Button variant="primary" size="md">Medium</Button>
					<Button variant="primary" size="lg">Large</Button>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Estados</h3>
				<div class="flex gap-3 flex-wrap">
					<Button variant="primary">Normal</Button>
					<Button variant="primary" disabled>Disabled</Button>
				</div>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<Button variant="primary">Click me</Button>
<Button variant="secondary" size="sm">Small button</Button>
<Button variant="hero" size="lg">Epic Action</Button>
<Button variant="danger" disabled>Disabled</Button>`}</code></pre>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Efeitos de Hover</h3>
				<p class="text-sm text-gray-11 mb-4">
					Todos os botões agora possuem efeitos de brilho ao passar o mouse:
				</p>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>Primary & Hero:</strong> Brilho dourado (gold-600)</li>
					<li>• <strong>Secondary:</strong> Brilho cyan suave (border-glow)</li>
					<li>• <strong>Borders:</strong> Todos usam border-2 para maior definição</li>
					<li>• <strong>Rounded:</strong> md/lg botões usam rounded-2xl</li>
				</ul>
			</Card>
		</section>

		<!-- Card Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Card</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<Card>
					<h3 class="text-lg font-semibold mb-2">Default Card</h3>
					<p class="text-gray-11">Cartão padrão com fundo sólido e sombra média</p>
				</Card>

				<Card variant="elevated">
					<h3 class="text-lg font-semibold mb-2">Elevated Card</h3>
					<p class="text-gray-11">Cartão com sombra profunda para máxima elevação</p>
				</Card>

				<Card variant="outlined">
					<h3 class="text-lg font-semibold mb-2">Outlined Card</h3>
					<p class="text-gray-11">Cartão com borda ao invés de fundo</p>
				</Card>

				<Card variant="gold">
					<h3 class="text-lg font-semibold mb-2">Gold Card</h3>
					<p class="text-gray-11">Cartão especial com borda dourada e efeito de brilho</p>
				</Card>
			</div>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Tamanhos de Padding</h3>
				<div class="space-y-4">
					<Card padding="sm" variant="outlined">
						<p class="text-sm">Padding pequeno (sm)</p>
					</Card>
					<Card padding="md" variant="outlined">
						<p>Padding médio (md)</p>
					</Card>
					<Card padding="lg" variant="outlined">
						<p>Padding grande (lg)</p>
					</Card>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Exemplo: Character Card</h3>
				<Card variant="elevated" class="max-w-sm">
					<div class="flex items-center gap-4 mb-4">
						<div
							class="w-16 h-16 bg-primary-9 rounded-full flex items-center justify-center text-white text-2xl font-bold"
						>
							W
						</div>
						<div>
							<h3 class="text-xl font-bold">Warrior</h3>
							<p class="text-sm text-gray-11">Level 15</p>
						</div>
					</div>
					<div class="space-y-2 mb-4">
						<div class="flex justify-between">
							<span class="text-gray-11">Health:</span>
							<span class="font-semibold">250/250</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-11">Strength:</span>
							<span class="font-semibold">45</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-11">Combat Power:</span>
							<span class="font-semibold">1,250</span>
						</div>
					</div>
					<Button variant="primary" class="w-full">Enter Arena</Button>
				</Card>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<Card>Content here</Card>
<Card variant="elevated">Elevated content</Card>
<Card variant="gold">Special gold card</Card>
<Card variant="outlined" padding="lg">Large padding</Card>`}</code></pre>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Aprimoramentos Dark Fantasy</h3>
				<p class="text-sm text-gray-11 mb-4">
					Cards agora possuem estilo aprimorado para melhor imersão:
				</p>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>Bordas:</strong> Aumentadas para rounded-3xl (mais suaves)</li>
					<li>• <strong>Blur:</strong> backdrop-blur-lg para efeito glassmorphism</li>
					<li>• <strong>Sombras:</strong> Profundidade customizada por variante</li>
					<li>• <strong>Gold:</strong> Brilho dourado shadow-[0_0_20px_rgba(201,152,74,0.4)]</li>
					<li>• <strong>Elevated:</strong> Sombra profunda shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]</li>
				</ul>
			</Card>
		</section>

		<!-- Input Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Input</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Tipos de Input</h3>
				<div class="space-y-4 max-w-md">
					<Input
						type="text"
						label="Text Input"
						placeholder="Digite algo..."
						bind:value={textValue}
					/>
					<p class="text-sm text-gray-11">Valor: {textValue}</p>

					<Input
						type="email"
						label="Email Input"
						placeholder="seu@email.com"
						bind:value={emailValue}
					/>

					<Input
						type="password"
						label="Password Input"
						placeholder="Senha segura"
						bind:value={passwordValue}
					/>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Estados</h3>
				<div class="space-y-4 max-w-md">
					<Input type="text" label="Normal" placeholder="Input normal" />

					<Input type="text" label="Com Erro" error="Este campo é obrigatório" />

					<Input type="text" label="Desabilitado" value="Não editável" disabled />

					<Input type="text" label="Campo Obrigatório" placeholder="Digite aqui..." required />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Efeitos de Foco Dark Fantasy</h3>
				<p class="text-sm text-gray-11 mb-4">
					Inputs agora possuem efeitos visuais aprimorados ao focar:
				</p>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>Bordas:</strong> Aumentadas para rounded-2xl e border-2</li>
					<li>• <strong>Foco Normal:</strong> Brilho dourado shadow-[0_0_20px_rgba(201,152,74,0.2)]</li>
					<li>• <strong>Foco com Erro:</strong> Brilho laranja shadow-[0_0_20px_rgba(255,107,53,0.2)]</li>
					<li>• <strong>Transição:</strong> Animação suave de 300ms</li>
					<li>• <strong>Placeholder:</strong> Texto com opacidade reduzida (text-muted)</li>
				</ul>
				<div class="mt-4">
					<p class="text-xs text-gray-11 mb-2">Teste o efeito de foco clicando nos campos:</p>
					<div class="space-y-3">
						<Input type="text" placeholder="Clique aqui para ver o brilho dourado..." />
						<Input type="text" error="Campo inválido" placeholder="Brilho laranja no erro..." />
					</div>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Exemplo: Login Form</h3>
				<div class="max-w-sm space-y-4">
					<h3 class="text-xl font-bold">Login</h3>
					<Input type="email" label="Email" placeholder="seu@email.com" />
					<Input type="password" label="Senha" placeholder="Digite sua senha" />
					<Button variant="primary" class="w-full">Entrar</Button>
				</div>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<Input
  type="text"
  label="Username"
  placeholder="Enter username"
  bind:value={username}
/>

<Input
  type="email"
  label="Email"
  error="Invalid email"
/>`}</code></pre>
			</Card>
		</section>

		<!-- ProgressBar Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">ProgressBar</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Tipos de Barra</h3>
				<div class="space-y-6 max-w-md">
					<ProgressBar type="hp" current={175} max={250} />
					<ProgressBar type="mana" current={80} max={120} />
					<ProgressBar type="xp" current={650} max={1000} />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Tamanhos</h3>
				<div class="space-y-6 max-w-md">
					<div>
						<p class="text-xs text-gray-11 mb-2">Thin (padrão)</p>
						<ProgressBar type="hp" current={120} max={200} size="thin" />
					</div>
					<div>
						<p class="text-xs text-gray-11 mb-2">Thick</p>
						<ProgressBar type="hp" current={120} max={200} size="thick" />
					</div>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Com e Sem Label</h3>
				<div class="space-y-6 max-w-md">
					<ProgressBar type="mana" current={45} max={100} showLabel={true} />
					<ProgressBar type="mana" current={45} max={100} showLabel={false} />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Exemplo: Character Stats</h3>
				<Card variant="elevated" class="max-w-sm">
					<h3 class="text-lg font-semibold mb-4">Warrior Stats</h3>
					<div class="space-y-4">
						<ProgressBar type="hp" current={245} max={250} size="thick" />
						<ProgressBar type="mana" current={30} max={80} size="thick" />
						<ProgressBar type="xp" current={1850} max={2000} />
					</div>
				</Card>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<ProgressBar type="hp" current={175} max={250} />
<ProgressBar type="mana" current={80} max={120} size="thick" />
<ProgressBar type="xp" current={650} max={1000} showLabel={false} />`}</code></pre>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Características</h3>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>HP:</strong> Gradiente laranja (orange-600 → orange-500)</li>
					<li>• <strong>Mana:</strong> Gradiente cyan (cyan-600 → cyan-400)</li>
					<li>• <strong>XP:</strong> Gradiente verde (green-600 → green-400)</li>
					<li>• <strong>Animação:</strong> Transição suave de 500ms ao mudar valor</li>
					<li>• <strong>Label:</strong> Fonte monoespaçada para números</li>
					<li>• <strong>Background:</strong> Fundo escuro com sombra interna</li>
				</ul>
			</Card>
		</section>

		<!-- Modal Components -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Modals</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Victory Modal</h3>
				<p class="text-sm text-gray-11 mb-4">
					Modal exibido quando o jogador vence um combate, mostrando XP e Gold ganhos.
				</p>
				<Button variant="primary" onclick={() => (showVictoryModal = true)}>
					Show Victory Modal
				</Button>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Defeat Modal</h3>
				<p class="text-sm text-gray-11 mb-4">
					Modal exibido quando o jogador perde um combate, com opção de respawn.
				</p>
				<Button variant="danger" onclick={() => (showDefeatModal = true)}>
					Show Defeat Modal
				</Button>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Características dos Modals</h3>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>Backdrop:</strong> Fundo escuro com backdrop-blur-xl (95% opacity)</li>
					<li>• <strong>Animação:</strong> Fade in de 200ms ao aparecer</li>
					<li>• <strong>Escape Key:</strong> Fecha o modal ao pressionar ESC (configurável)</li>
					<li>• <strong>Click Outside:</strong> Fecha ao clicar fora (configurável)</li>
					<li>• <strong>Victory:</strong> Card dourado com ícone Trophy pulsante</li>
					<li>• <strong>Defeat:</strong> Card com borda laranja e ícone Skull pulsante</li>
					<li>• <strong>Acessibilidade:</strong> role="dialog" e aria-modal</li>
				</ul>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<script>
  let showVictoryModal = $state(false);
</script>

<VictoryModal
  bind:open={showVictoryModal}
  xpGained={350}
  goldGained={125}
  onContinue={() => showVictoryModal = false}
/>

<DefeatModal
  bind:open={showDefeatModal}
  onRespawn={() => showDefeatModal = false}
/>`}</code></pre>
			</Card>
		</section>

		<!-- StatDisplay Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">StatDisplay</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Variante Padrão</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
					<StatDisplay label="Strength" value={45} />
					<StatDisplay label="Intelligence" value={32} />
					<StatDisplay label="Dexterity" value={28} />
					<StatDisplay label="Vitality" value={50} />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Variante Compacta</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
					<StatDisplay label="Strength" value={45} variant="compact" />
					<StatDisplay label="Intelligence" value={32} variant="compact" />
					<StatDisplay label="Dexterity" value={28} variant="compact" />
					<StatDisplay label="Vitality" value={50} variant="compact" />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Com Valores Grandes</h3>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
					<StatDisplay label="Gold" value={12450} />
					<StatDisplay label="Combat Power" value={1250} />
					<StatDisplay label="Total XP" value={45800} />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Exemplo: Character Stats Panel</h3>
				<Card variant="elevated" class="max-w-md">
					<h3 class="text-lg font-semibold mb-4">Character Stats</h3>
					<div class="grid grid-cols-2 gap-3">
						<StatDisplay label="Strength" value={45} variant="compact" />
						<StatDisplay label="Intelligence" value={32} variant="compact" />
						<StatDisplay label="Dexterity" value={28} variant="compact" />
						<StatDisplay label="Vitality" value={50} variant="compact" />
					</div>
				</Card>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<StatDisplay label="Strength" value={45} />
<StatDisplay label="Gold" value={12450} variant="compact" />`}</code></pre>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Características</h3>
				<ul class="text-sm text-gray-11 space-y-2">
					<li>• <strong>Default:</strong> Fundo elevado com borda, texto maior (text-2xl)</li>
					<li>• <strong>Compact:</strong> Fundo escuro transparente, texto médio (text-xl)</li>
					<li>• <strong>Números:</strong> Fonte monoespaçada com formatação automática (1,250)</li>
					<li>• <strong>Label:</strong> Texto secundário/muted conforme variante</li>
					<li>• <strong>Flexível:</strong> Aceita números ou strings como valor</li>
				</ul>
			</Card>
		</section>

		<!-- Game Components -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Game Components</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">CharacterSheet</h3>
				<p class="text-sm text-gray-11 mb-4">
					Exibe informações completas do personagem incluindo stats, HP, XP e gold.
				</p>
				<div class="max-w-sm mx-auto">
					<CharacterSheet character={mockCharacter} />
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">ClassCard</h3>
				<p class="text-sm text-gray-11 mb-4">
					Cards de seleção de classe com ícone, descrição e stats iniciais.
				</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each classes as classOption}
						<ClassCard
							{...classOption}
							selected={selectedClass === classOption.id}
							onclick={() => (selectedClass = classOption.id)}
						/>
					{/each}
				</div>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">Uso</h3>
				<pre class="bg-gray-3 p-4 rounded-md text-sm overflow-x-auto"><code>{`<CharacterSheet character={{
  name: 'Aragorn',
  class: 'warrior',
  level: 12,
  hp: { current: 245, max: 250 },
  xp: { current: 1850, max: 2000 },
  stats: { strength: 45, intelligence: 28, dexterity: 32, vitality: 50 },
  gold: 12450
}} />

<ClassCard
  id="warrior"
  name="Warrior"
  description="A fierce melee combatant..."
  icon={Sword}
  color="#ff6b35"
  stats={{ strength: 15, intelligence: 8, dexterity: 10, vitality: 14 }}
  selected={selectedClass === 'warrior'}
  onclick={() => setSelectedClass('warrior')}
/>`}</code></pre>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">AdventureLog</h3>
				<p class="text-sm text-gray-11 mb-4">
					Log de mensagens de aventura com cores por tipo (normal, danger, success, gold, xp).
				</p>
				<Card variant="elevated">
					<AdventureLog messages={adventureMessages} />
				</Card>
			</Card>

			<Card>
				<h3 class="text-lg font-semibold mb-4">CombatLog</h3>
				<p class="text-sm text-gray-11 mb-4">
					Log de mensagens de combate com cores por tipo (player, enemy, damage, heal, critical, miss).
				</p>
				<Card variant="elevated">
					<CombatLog messages={combatMessages} />
				</Card>
			</Card>
		</section>

		<!-- Color Palette -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Paleta de Cores</h2>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Primary (Azul)</h3>
				<div class="grid grid-cols-6 gap-2">
					<div class="text-center">
						<div class="bg-primary-1 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">1</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-2 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">2</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-3 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">3</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-4 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">4</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-5 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">5</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-6 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">6</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-7 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">7</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-8 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">8</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-9 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">9</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-10 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">10</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-11 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">11</span>
					</div>
					<div class="text-center">
						<div class="bg-primary-12 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">12</span>
					</div>
				</div>
			</Card>

			<Card class="mb-6">
				<h3 class="text-lg font-semibold mb-4">Gray (Neutro)</h3>
				<div class="grid grid-cols-6 gap-2">
					<div class="text-center">
						<div class="bg-gray-1 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">1</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-2 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">2</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-3 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">3</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-4 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">4</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-5 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">5</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-6 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">6</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-7 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">7</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-8 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">8</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-9 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">9</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-10 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">10</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-11 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">11</span>
					</div>
					<div class="text-center">
						<div class="bg-gray-12 h-16 rounded-md mb-1"></div>
						<span class="text-xs text-gray-11">12</span>
					</div>
				</div>
			</Card>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<h3 class="text-lg font-semibold mb-4">Success (Verde)</h3>
					<div class="flex gap-2">
						<div class="text-center flex-1">
							<div class="bg-green-9 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">9</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-green-10 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">10</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-green-11 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">11</span>
						</div>
					</div>
				</Card>

				<Card>
					<h3 class="text-lg font-semibold mb-4">Danger (Vermelho)</h3>
					<div class="flex gap-2">
						<div class="text-center flex-1">
							<div class="bg-red-9 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">9</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-red-10 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">10</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-red-11 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">11</span>
						</div>
					</div>
				</Card>

				<Card>
					<h3 class="text-lg font-semibold mb-4">Warning (Amarelo)</h3>
					<div class="flex gap-2">
						<div class="text-center flex-1">
							<div class="bg-yellow-9 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">9</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-yellow-10 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">10</span>
						</div>
						<div class="text-center flex-1">
							<div class="bg-yellow-11 h-12 rounded-md mb-1"></div>
							<span class="text-xs text-gray-11">11</span>
						</div>
					</div>
				</Card>
			</div>
		</section>

		<!-- Typography -->
		<section>
			<h2 class="text-3xl font-bold mb-6">Tipografia</h2>

			<Card>
				<div class="space-y-4">
					<div>
						<h1 class="text-4xl font-bold">Heading 1</h1>
						<code class="text-xs text-gray-11">text-4xl font-bold</code>
					</div>
					<div>
						<h2 class="text-3xl font-bold">Heading 2</h2>
						<code class="text-xs text-gray-11">text-3xl font-bold</code>
					</div>
					<div>
						<h3 class="text-2xl font-bold">Heading 3</h3>
						<code class="text-xs text-gray-11">text-2xl font-bold</code>
					</div>
					<div>
						<h4 class="text-xl font-semibold">Heading 4</h4>
						<code class="text-xs text-gray-11">text-xl font-semibold</code>
					</div>
					<div>
						<p class="text-base">Body text - Regular paragraph text</p>
						<code class="text-xs text-gray-11">text-base</code>
					</div>
					<div>
						<p class="text-sm text-gray-11">Small text - Secondary information</p>
						<code class="text-xs text-gray-11">text-sm text-gray-11</code>
					</div>
				</div>
			</Card>
		</section>
	</div>
</div>

<!-- Modal Instances -->
<VictoryModal
	bind:open={showVictoryModal}
	xpGained={350}
	goldGained={125}
	onContinue={() => (showVictoryModal = false)}
/>

<DefeatModal bind:open={showDefeatModal} onRespawn={() => (showDefeatModal = false)} />
