<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let textValue = $state('');
	let emailValue = $state('');
	let passwordValue = $state('');
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
<Button variant="danger" disabled>Disabled</Button>`}</code></pre>
			</Card>
		</section>

		<!-- Card Component -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-6">Card</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<Card>
					<h3 class="text-lg font-semibold mb-2">Default Card</h3>
					<p class="text-gray-11">Cartão padrão com fundo sólido</p>
				</Card>

				<Card variant="elevated">
					<h3 class="text-lg font-semibold mb-2">Elevated Card</h3>
					<p class="text-gray-11">Cartão com sombra para elevação</p>
				</Card>

				<Card variant="outlined">
					<h3 class="text-lg font-semibold mb-2">Outlined Card</h3>
					<p class="text-gray-11">Cartão com borda ao invés de fundo</p>
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
<Card variant="outlined" padding="lg">Large padding</Card>`}</code></pre>
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
