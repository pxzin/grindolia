# 🎮 Grindolia - Fantasy RPG Dungeon Crawler

A web-based multiplayer RPG game built with SvelteKit, featuring dungeon exploration, turn-based combat, and character progression.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (auto-seeds database on first run)
pnpm dev

# Open browser to http://localhost:5173
```

## 📖 Demo Instructions

See [DEMO_INSTRUCTIONS.md](./DEMO_INSTRUCTIONS.md) for complete testing guide.

**Quick Test Flow**:
1. Register account at `/auth/register`
2. Create character at `/character/create`
3. Enter dungeon at `/dungeon`
4. Fight monsters and descend floors!

## ✨ Features

### ✅ Implemented (MVP)
- **Character Creation**: 3 classes (Warrior, Mage, Rogue)
- **Dungeon System**: 5-floor dungeon with increasing difficulty
- **Turn-based Combat**: Damage, crits, dodges
- **Progression**: XP, leveling, stat growth
- **Loot System**: Random item drops, gold rewards
- **Monster Variety**: 7 different monster types

### 🔨 In Progress
- Inventory management (items collected, not equippable yet)
- Character HP persistence
- WebSocket real-time updates

### 📋 Planned
- Quest system integration
- Arena PvP battles
- Auction house
- Leaderboards
- Multiple dungeons

## 🏗️ Tech Stack

- **Framework**: SvelteKit + Svelte 5 (runes)
- **Styling**: UnoCSS + Radix Colors
- **Database**: SQLite (better-sqlite3)
- **Session**: Redis (in-memory for MVP)
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + Playwright

---

### Pré-requisitos

- Node.js 18+ ou superior
- pnpm (recomendado)

### Instalação

```bash
# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:5173`

## 🎨 Design System

Para visualizar todos os componentes do design system:

```bash
pnpm dev
```

Acesse `http://localhost:5173/design-system` no navegador.

Você verá:
- Todos os componentes UI (Button, Card, Input)
- Paleta de cores completa (Radix Colors)
- Tipografia e hierarquia
- Exemplos de código para cada componente
- Casos de uso reais (character cards, forms, etc)

## 🧪 Testes

### Testes Unitários (Vitest)

```bash
# Executar testes uma vez
pnpm test

# Modo watch (re-executa ao modificar arquivos)
pnpm test:watch

# Interface gráfica
pnpm test:ui

# Cobertura
pnpm test:coverage
```

### Testes E2E (Playwright)

```bash
# Executar testes E2E
pnpm test:e2e

# Com interface gráfica
pnpm test:e2e:ui
```

Para mais informações sobre testes, consulte [TESTING.md](TESTING.md).

## 🏗️ Estrutura do Projeto

```
grindolia/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/           # Componentes base (Button, Card, Input)
│   │   │   └── game/         # Componentes do jogo
│   │   ├── stores/           # Svelte stores (usando runes)
│   │   ├── types/            # TypeScript types
│   │   ├── services/         # Serviços (WebSocket, API)
│   │   └── config/           # Configurações
│   ├── routes/               # Rotas SvelteKit
│   └── i18n/                 # Internacionalização
├── server/
│   ├── database/             # Schema, repositórios, migrations
│   ├── websocket/            # WebSocket server e handlers
│   └── utils/                # Utilitários (logger, validation, anti-cheat)
├── tests/                    # Testes
└── design-system/            # Design system documentation
```

## 📚 Stack Tecnológica

### Frontend
- **SvelteKit** - Framework full-stack
- **Svelte 5** - Framework reativo com runes
- **TypeScript** - Tipagem estática
- **UnoCSS** - Utility-first CSS
- **Radix Colors** - Sistema de cores acessível

### Backend
- **SvelteKit** - API endpoints
- **SQLite** (WAL mode) - Database
- **Redis** - Sessões e pub/sub
- **WebSocket** - Comunicação real-time
- **bcrypt** - Hash de senhas

### Testes
- **Vitest** - Testes unitários
- **Playwright** - Testes E2E

### Ferramentas
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **TypeScript** - Type checking

## 🎮 Features

### Implementado
- ✅ Sistema de autenticação (registro, login)
- ✅ Gerenciamento de sessões com Redis
- ✅ WebSocket para comunicação real-time
- ✅ Sistema de banco de dados com SQLite
- ✅ Sistema de tipos completo
- ✅ Design system com componentes base
- ✅ Internacionalização (i18n) - 7 idiomas
- ✅ Utilitários de validação e anti-cheat
- ✅ Logger estruturado

### Em Desenvolvimento
- 🚧 Criação de personagens
- 🚧 Sistema de quests
- 🚧 Inventário e items
- 🚧 Arena PvP
- 🚧 Auction House
- 🚧 Leaderboards

## 🌍 Idiomas Suportados

- 🇺🇸 English (en)
- 🇧🇷 Português (pt-BR)
- 🇪🇸 Español (es)
- 🇷🇺 Русский (ru)
- 🇨🇳 中文 (zh)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build |
| `pnpm check` | Type checking |
| `pnpm test` | Testes unitários |
| `pnpm test:e2e` | Testes E2E |

## 🛠️ Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Database
DATABASE_PATH=./data/grindolia.db

# Redis
REDIS_URL=redis://localhost:6379

# Session
SESSION_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

### Redis

Certifique-se de que o Redis está rodando:

```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

## 📖 Documentação

- [TESTING.md](TESTING.md) - Guia completo de testes
- [specs/](specs/) - Especificações e planejamento do projeto

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e não possui licença pública.

## 🎯 Roadmap

Consulte [tasks.md](specs/001-fantasy-rpg-game/tasks.md) para o roadmap completo e tarefas planejadas.
