# Implementation Plan: Fantasy RPG Multiplayer Game

**Branch**: `001-fantasy-rpg-game` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fantasy-rpg-game/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web-based multiplayer RPG game inspired by D&D, Lord of the Rings, and Japanese isekai anime, featuring humorous narrative, character progression, idle arena combat, auction house trading, and leaderboards. The game uses SvelteKit with Svelte 5 runes, server-authoritative game logic to prevent cheating, WebSocket real-time communication, SQLite persistence with Redis for WebSocket state, UnoCSS with Radix color tokens for theming, and a comprehensive design system with documentation.

## Technical Context

**Language/Version**: TypeScript 5.3+ with SvelteKit (Svelte 5 with runes)

**Primary Dependencies**:

- Frontend: SvelteKit, Svelte 5, UnoCSS, Radix Colors, Histoire (Storybook alternative)
- Backend: SvelteKit server routes, Socket.IO or native WebSocket API
- Database: better-sqlite3 (synchronous SQLite), ioredis (Redis client)
- Testing: Vitest, Playwright, Testing Library

**Storage**: SQLite (primary persistence) + Redis (WebSocket session/state management)

**Testing**: Vitest (unit/integration), Playwright (E2E), Testing Library (component)

**Target Platform**: Web (modern browsers with WebSocket support), Node.js 20+ server

**Project Type**: Web application (SvelteKit full-stack)

**Performance Goals**:

- <100ms server response time for game actions
- <50ms WebSocket message latency
- Support 100+ concurrent WebSocket connections
- Handle 1000+ quest/combat calculations per second

**Constraints**:

- All critical game logic (combat, progression, economy) server-side only
- WebSocket primary transport with polling fallback
- Real-time UI updates via WebSocket for immediate feedback
- Themeable UI supporting class/level-specific themes and premium themes
- Developer mode for debugging and testing

**Scale/Scope**:

- Initial: 100-500 concurrent players
- Content: 20+ levels, 3+ character classes, 50+ quests, 100+ items
- UI Components: 50+ documented design system components
- Real-time features: Quest progression, arena combat, auction updates, leaderboards

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Specification-First Development

- **Status**: PASS
- **Evidence**: Comprehensive specification created in [spec.md](./spec.md) with 7 user stories, 52 functional requirements, 23 success criteria
- **Compliance**: Plan follows spec → plan → tasks → implement workflow

### ✅ II. Test-Driven Development

- **Status**: PASS (tests optional per spec, but framework included)
- **Evidence**: Testing strategy defined with Vitest for unit/integration, Playwright for E2E, Testing Library for components
- **Compliance**: TDD will be enforced when tests are required per user story

### ✅ III. Independent User Stories

- **Status**: PASS
- **Evidence**: 7 prioritized user stories (P1-P7) in spec, each independently testable and deployable
- **Compliance**: Architecture supports incremental delivery (P1 character creation can deploy alone)

### ✅ IV. Simplicity and YAGNI

- **Status**: PASS with justifications
- **Evidence**: Tech stack justified by requirements (see Complexity Tracking)
- **Compliance**: Using SvelteKit's built-in features, avoiding premature abstractions

### ✅ V. Observability and Transparency

- **Status**: PASS
- **Evidence**: Developer mode planned, structured logging, WebSocket message inspection, component documentation
- **Compliance**: All game state changes observable, UI state transparent, debug tools included

### Quality Standards Compliance

**Code Quality**:

- ✅ Linting: ESLint + Prettier configured
- ✅ Type Safety: TypeScript strict mode
- ✅ Documentation: Design system with Histoire, API docs in contracts/
- ✅ Versioning: Semantic versioning for releases

**Testing Standards**:

- ✅ Contract Tests: API endpoints tested via Vitest
- ✅ Integration Tests: User journeys via Playwright
- ✅ Component Tests: UI components via Testing Library
- ✅ Coverage: Will be defined per user story in tasks.md

**Documentation Standards**:

- ✅ Specification: [spec.md](./spec.md) completed
- ✅ Implementation Plan: This document
- ✅ API Contracts: Will be generated in contracts/
- ✅ Quickstart: Will be generated in quickstart.md

**Gate Decision**: ✅ PROCEED to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-fantasy-rpg-game/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── websocket.md     # WebSocket message protocol
│   ├── rest-api.yaml    # REST API OpenAPI spec
│   └── game-events.md   # Game event schema
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# SvelteKit Full-Stack Web Application Structure

# Root configuration
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── uno.config.ts              # UnoCSS configuration with Radix tokens
├── .env.example               # Environment variables template
└── playwright.config.ts       # E2E testing configuration

# Source code
src/
├── lib/
│   ├── components/            # Design system components
│   │   ├── ui/                # Base UI components (Button, Input, Card, etc.)
│   │   ├── game/              # Game-specific components (CharacterSheet, QuestLog, etc.)
│   │   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   │   └── index.ts           # Component exports
│   ├── stores/                # Svelte 5 runes-based reactive stores
│   │   ├── character.svelte.ts    # Character state
│   │   ├── quest.svelte.ts        # Quest state
│   │   ├── inventory.svelte.ts    # Inventory state
│   │   ├── websocket.svelte.ts    # WebSocket connection state
│   │   └── theme.svelte.ts        # Theme state
│   ├── services/              # Business logic services
│   │   ├── websocket.ts       # WebSocket client service
│   │   ├── api.ts             # REST API client
│   │   └── storage.ts         # Local storage utilities
│   ├── types/                 # TypeScript type definitions
│   │   ├── character.ts
│   │   ├── quest.ts
│   │   ├── item.ts
│   │   ├── arena.ts
│   │   ├── auction.ts
│   │   └── websocket.ts       # WebSocket message types
│   ├── utils/                 # Utility functions
│   │   ├── combat.ts          # Combat calculation utilities
│   │   ├── progression.ts     # XP/leveling utilities
│   │   └── validation.ts      # Input validation
│   └── config/                # Configuration constants
│       ├── classes.ts         # Character class definitions
│       ├── items.ts           # Item database
│       └── theme-tokens.ts    # Radix color token mappings
│
├── routes/                    # SvelteKit routes (pages + API)
│   ├── +layout.svelte         # Root layout
│   ├── +page.svelte           # Home/landing page
│   ├── auth/
│   │   ├── login/+page.svelte
│   │   └── register/+page.svelte
│   ├── character/
│   │   ├── create/+page.svelte
│   │   └── [id]/+page.svelte  # Character detail page
│   ├── quest/
│   │   ├── +page.svelte       # Quest list
│   │   └── [id]/+page.svelte  # Quest detail
│   ├── arena/+page.svelte     # Arena combat
│   ├── auction/+page.svelte   # Auction house
│   ├── leaderboard/+page.svelte
│   ├── inventory/+page.svelte
│   │
│   └── api/                   # Server-side API routes
│       ├── auth/
│       │   ├── login/+server.ts
│       │   └── register/+server.ts
│       ├── character/
│       │   ├── +server.ts         # List/create characters
│       │   └── [id]/+server.ts    # Character CRUD
│       ├── quest/
│       │   ├── +server.ts
│       │   ├── [id]/+server.ts
│       │   └── [id]/complete/+server.ts
│       ├── arena/
│       │   ├── +server.ts         # Initiate combat
│       │   └── [id]/+server.ts    # Combat results
│       ├── auction/
│       │   ├── +server.ts         # List/search auctions
│       │   ├── create/+server.ts
│       │   └── [id]/buy/+server.ts
│       ├── leaderboard/+server.ts
│       └── websocket/+server.ts   # WebSocket upgrade handler
│
├── hooks.server.ts            # SvelteKit server hooks (auth, WebSocket)
└── app.html                   # HTML template

# Server-side game logic (outside src/ for clear separation)
server/
├── game/                      # Server-authoritative game logic
│   ├── combat/
│   │   ├── calculator.ts      # Combat calculation engine
│   │   └── arena.ts           # Arena matchmaking & resolution
│   ├── progression/
│   │   ├── experience.ts      # XP and leveling
│   │   └── abilities.ts       # Ability unlocking
│   ├── economy/
│   │   ├── auction.ts         # Auction house logic
│   │   └── pricing.ts         # Dynamic pricing
│   └── quest/
│       ├── manager.ts         # Quest state management
│       └── rewards.ts         # Reward distribution
│
├── database/                  # Database layer
│   ├── schema.ts              # SQLite schema definitions
│   ├── migrations/            # Database migrations
│   ├── repositories/          # Data access layer
│   │   ├── character.ts
│   │   ├── quest.ts
│   │   ├── item.ts
│   │   ├── auction.ts
│   │   └── arena.ts
│   └── seed.ts                # Initial data seeding
│
├── websocket/                 # WebSocket server logic
│   ├── server.ts              # WebSocket server setup
│   ├── handlers/              # Message handlers
│   │   ├── quest.ts
│   │   ├── combat.ts
│   │   ├── auction.ts
│   │   └── leaderboard.ts
│   ├── redis.ts               # Redis connection & pub/sub
│   └── session.ts             # Session management
│
└── utils/
    ├── logger.ts              # Structured logging
    ├── validation.ts          # Server-side validation
    └── anti-cheat.ts          # Anti-cheat validation

# Testing
tests/
├── unit/                      # Vitest unit tests
│   ├── game/                  # Game logic tests
│   ├── components/            # Component tests
│   └── utils/                 # Utility tests
├── integration/               # Vitest integration tests
│   ├── api/                   # API endpoint tests
│   └── websocket/             # WebSocket tests
└── e2e/                       # Playwright E2E tests
    ├── character-creation.spec.ts
    ├── questing.spec.ts
    ├── arena.spec.ts
    └── auction.spec.ts

# Design System Documentation
design-system/
├── .histoire/                 # Histoire configuration
├── src/
│   └── components/            # Component stories
│       ├── Button.story.svelte
│       ├── Card.story.svelte
│       └── CharacterSheet.story.svelte
└── histoire.config.ts

# Database & Cache
database/
├── grindolia.db               # SQLite database (gitignored)
└── grindolia.db-wal           # Write-ahead log (gitignored)

# Static assets
static/
├── images/
│   ├── characters/
│   ├── items/
│   ├── zones/
│   └── ui/
├── sounds/
│   ├── sfx/
│   └── music/
└── fonts/

# Developer mode
src/lib/dev/
├── debug-panel.svelte         # Developer debug panel component
├── state-inspector.svelte     # State inspection tools
└── websocket-monitor.svelte   # WebSocket message monitor
```

**Structure Decision**:

This structure follows SvelteKit's conventions for a full-stack web application with clear separation between:

- **Frontend** (`src/lib`, `src/routes/*.svelte`): Svelte 5 components, stores (runes), services
- **API** (`src/routes/api`): SvelteKit server routes for REST endpoints
- **Server Logic** (`server/`): Game logic, database, WebSocket handlers (separate from routes for clarity)
- **Design System** (`design-system/`): Component documentation with Histoire
- **Testing** (`tests/`): Unit, integration, and E2E tests

This separation ensures:

1. **Server-authoritative architecture**: Critical logic in `server/game/` cannot be accessed from client
2. **Clear boundaries**: Frontend components don't directly import server logic
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Server logic can be extracted to microservices later if needed

## Complexity Tracking

> **Justifications for technology choices that add complexity**

| Potential Complexity | Why Needed | Simpler Alternative Rejected Because |
|---------------------|------------|-------------------------------------|
| WebSocket + Redis | Real-time game updates with immediate feedback for quest completion, combat results, auction bids | Polling every 1-2 seconds creates poor UX (latency), inefficient (constant requests), and doesn't meet <50ms update requirement |
| Server-authoritative game logic | Prevent cheating - combat calculations, XP gains, item drops must be server-side | Client-side logic easily exploited (inspect network, modify values), ruins game economy and fairness |
| SQLite + Redis dual storage | SQLite for persistence, Redis for WebSocket session state and pub/sub across connections | PostgreSQL alone adds deployment complexity, Redis provides <10ms access for real-time features |
| Design system with Histoire | 50+ components need documentation, theming requires systematic tokens, premium themes are monetizable | Ad-hoc components lead to inconsistency, Storybook is heavier (Histoire is Vite-native, faster) |
| UnoCSS with semantic tokens | Dynamic theming by class/level/premium, Radix color system ensures accessibility | Tailwind doesn't support runtime theme switching easily, custom CSS scales poorly with 50+ components |
| TypeScript strict mode | Type safety across client-server boundary prevents runtime errors in game logic | JavaScript would allow type mismatches between WebSocket messages, API contracts, and DB schemas |
| Svelte 5 runes | Modern reactivity model, better performance than Svelte 4 stores, cleaner syntax for game state | Svelte 4 stores work but runes provide finer-grained reactivity needed for real-time updates |

**Complexity Justification Summary**: Each complexity addition directly addresses a functional requirement (real-time updates, anti-cheat, theming, component documentation) or performance constraint (WebSocket latency, server response time). Simpler alternatives would fail to meet success criteria (SC-008: arena combat <30s, SC-011: load <5s, SC-014: actions <1s).

---

**Next Phase**: Phase 0 - Research & Technology Decisions (see research.md when generated)
