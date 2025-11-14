# Research: Fantasy RPG Multiplayer Game

**Feature**: Fantasy RPG Multiplayer Game
**Branch**: `001-fantasy-rpg-game`
**Date**: 2025-11-13
**Purpose**: Document technology decisions, best practices research, and architectural patterns for the implementation

## Executive Summary

This document captures research findings and technology decisions for building a web-based multiplayer RPG game using SvelteKit, WebSockets, SQLite, and Redis. All decisions prioritize server-authoritative architecture to prevent cheating, real-time UI updates for player engagement, and a themeable design system for monetization opportunities.

## Technology Stack Decisions

### Decision 1: SvelteKit with Svelte 5 Runes

**Decision**: Use SvelteKit as the full-stack framework with Svelte 5 and runes for state management

**Rationale**:
- **Full-stack**: SvelteKit provides both frontend (Svelte components) and backend (server routes) in one framework, reducing complexity
- **Svelte 5 runes**: Modern reactivity model (`$state`, `$derived`, `$effect`) provides finer-grained reactivity than Svelte 4 stores
- **Performance**: Svelte compiles to vanilla JS with no virtual DOM, resulting in smaller bundles and faster runtime
- **Real-time updates**: Runes' reactivity model integrates seamlessly with WebSocket updates (state changes automatically trigger UI re-renders)
- **TypeScript**: First-class TypeScript support for type-safe client-server communication

**Alternatives Considered**:
1. **Next.js + React**:
   - Rejected: Larger bundle size, virtual DOM overhead, more complex state management (Redux/Zustand needed)
   - React's reconciliation can struggle with frequent WebSocket updates
2. **Nuxt + Vue 3**:
   - Rejected: Vue 3 Composition API similar to runes but larger ecosystem, less suitable for real-time apps
3. **Plain Node.js + Vanilla JS**:
   - Rejected: No framework means building routing, state management, and build tools from scratch

**Best Practices**:
- Use `$state` runes for character, quest, inventory, and WebSocket connection state
- Use `$derived` for computed values (e.g., character combat power from stats + equipment)
- Use `$effect` sparingly, only for side effects like WebSocket event listeners
- Keep runes in `.svelte.ts` files for clear separation from components

**References**:
- Svelte 5 Runes RFC: https://svelte.dev/blog/runes
- SvelteKit Docs: https://kit.svelte.dev/docs

---

### Decision 2: WebSocket + Redis for Real-Time Communication

**Decision**: Use WebSocket for primary real-time transport with Redis pub/sub for multi-instance scaling

**Rationale**:
- **Latency requirement**: Success criteria SC-014 requires <1s for action processing; WebSocket provides <50ms latency
- **Real-time features**: Quest completion, arena combat results, auction bids, leaderboard updates need instant feedback
- **Server-to-client push**: Server must push updates when other players' actions affect shared state (auction bids, leaderboard changes)
- **Redis pub/sub**: Enables horizontal scaling - multiple server instances can share WebSocket events via Redis channels
- **Fallback**: Long-polling fallback for clients that don't support WebSocket (corporate firewalls)

**Alternatives Considered**:
1. **HTTP Polling (setInterval + fetch)**:
   - Rejected: Inefficient (constant requests), high latency (1-2s delay), doesn't meet <50ms requirement
2. **Server-Sent Events (SSE)**:
   - Rejected: Unidirectional (server → client only), requires separate HTTP requests for client → server
3. **GraphQL Subscriptions**:
   - Rejected: Adds complexity (GraphQL layer), WebSocket underneath anyway, overkill for simple events

**Implementation Strategy**:
- Use native WebSocket API (no Socket.IO initially to keep it simple)
- Redis pub/sub pattern:
  - Each server instance subscribes to Redis channels (e.g., `arena:results`, `auction:bids`)
  - When action occurs on Server A, publish to Redis → all servers (including Server A) receive → broadcast to connected WebSocket clients
- Message format: JSON with `type` and `payload` (e.g., `{ type: "QUEST_COMPLETED", payload: { questId, rewards } }`)

**Best Practices**:
- Implement reconnection logic with exponential backoff
- Send heartbeat/ping every 30s to keep connection alive
- Store WebSocket session state in Redis (session ID → character ID mapping)
- Use Redis TTL for automatic session cleanup (e.g., 1 hour TTL, refresh on activity)

**References**:
- MDN WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Redis Pub/Sub: https://redis.io/docs/interact/pubsub/

---

### Decision 3: SQLite + better-sqlite3 for Persistence

**Decision**: Use SQLite with better-sqlite3 (synchronous driver) for primary database

**Rationale**:
- **Simplicity**: Single-file database, no separate database server to manage
- **Performance**: better-sqlite3 is synchronous and faster than async drivers for high-throughput operations
- **Sufficient scale**: Handles 100-500 concurrent players easily (read-heavy workload)
- **ACID transactions**: Critical for auction house (prevent duplicate purchases) and economy (currency transfers)
- **Write-Ahead Logging (WAL)**: Enables concurrent reads while writing

**Alternatives Considered**:
1. **PostgreSQL**:
   - Rejected: Adds deployment complexity (separate server), overkill for initial scale (100-500 users)
   - Would need PostgreSQL server + connection pooling + async driver
2. **MongoDB**:
   - Rejected: Relational data model (characters → quests, items → auctions) fits SQL better
3. **MySQL**:
   - Rejected: Similar to PostgreSQL - unnecessary complexity for initial scale

**Limitations & Mitigation**:
- **Single writer limitation**: SQLite has one writer at a time
  - Mitigation: WAL mode allows concurrent readers, most operations are reads (quest data, leaderboards)
  - Write operations (quest completion, auction purchase) are fast (<1ms with proper indexing)
- **Horizontal scaling**: SQLite doesn't replicate across servers
  - Mitigation: Not needed at initial scale (100-500 users); can migrate to PostgreSQL later if needed
  - Use Redis for scaling WebSocket connections, not database writes

**Schema Design Principles**:
- Normalize data (separate tables for characters, quests, items, auctions)
- Use foreign keys with ON DELETE CASCADE for referential integrity
- Index frequently queried columns (character_id, quest_id, auction status)
- Use JSON columns for flexible data (e.g., quest objectives, item properties) where appropriate

**Best Practices**:
- Enable WAL mode: `PRAGMA journal_mode=WAL;`
- Use transactions for multi-step operations (e.g., auction purchase = deduct currency + transfer item + update listing)
- Implement database migrations (use a simple migration system)
- Regular backups (SQLite = copy file, simple)

**References**:
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- SQLite WAL: https://www.sqlite.org/wal.html

---

### Decision 4: Redis for WebSocket Session State

**Decision**: Use Redis (ioredis client) for WebSocket session management and pub/sub

**Rationale**:
- **Session storage**: Map WebSocket session ID → character ID, user ID
- **Pub/sub**: Broadcast events across multiple server instances (see Decision 2)
- **Fast access**: <10ms read/write for session lookups on each WebSocket message
- **TTL**: Automatic session cleanup (1-hour TTL, refreshed on activity)
- **Atomic operations**: INCR/DECR for leaderboard counters, ZADD for sorted sets (arena rankings)

**Use Cases**:
1. **Session State**: `session:{sessionId}` → `{ userId, characterId, connectedAt }`
2. **Pub/Sub Channels**: `arena:results`, `auction:bids`, `leaderboard:updates`
3. **Leaderboards**: Sorted sets for real-time rankings (ZADD, ZRANGE)
4. **Rate Limiting**: Track action frequency per user (prevent spam)

**Alternatives Considered**:
1. **In-memory JavaScript Map**:
   - Rejected: Doesn't work across multiple server instances, lost on restart
2. **Database (SQLite) for sessions**:
   - Rejected: Slower than Redis (<1ms vs <10ms), no pub/sub, no TTL

**Best Practices**:
- Use key prefixes for namespacing (`session:*`, `leaderboard:*`, `arena:*`)
- Set appropriate TTLs (sessions: 1 hour, temporary data: 5 minutes)
- Use Redis transactions (MULTI/EXEC) for atomic operations
- Monitor Redis memory usage (Redis is in-memory, set max memory policy)

**References**:
- ioredis: https://github.com/redis/ioredis
- Redis Data Structures: https://redis.io/docs/data-types/

---

### Decision 5: UnoCSS with Radix Color Tokens

**Decision**: Use UnoCSS for styling with Radix Colors for semantic theming

**Rationale**:
- **Atomic CSS**: On-demand utility classes (like Tailwind) but faster build times
- **Dynamic theming**: Runtime theme switching via CSS variables (class/level-based themes, premium themes)
- **Radix Colors**: Accessible color system with semantic scales (e.g., `gray1-gray12`, `red1-red12`)
  - Automatic dark mode support
  - WCAG-compliant contrast ratios
- **Semantic tokens**: Define theme tokens (e.g., `--color-primary`, `--color-surface`) mapped to Radix scales
- **Bundle size**: UnoCSS generates only used classes (smaller than Tailwind)

**Theme Architecture**:
```typescript
// Theme token structure
themes = {
  warrior: { primary: 'red', accent: 'orange' },    // Maps to Radix red/orange scales
  mage: { primary: 'blue', accent: 'purple' },
  rogue: { primary: 'green', accent: 'teal' },
  premium_gold: { primary: 'amber', accent: 'yellow', overlay: 'gold-gradient' }
}
```

**Alternatives Considered**:
1. **Tailwind CSS**:
   - Rejected: Harder to do runtime theme switching (requires rebuilding or JIT mode complexity)
   - Larger bundle size (includes unused utilities)
2. **CSS Modules**:
   - Rejected: Manual theming, no utility classes, more boilerplate
3. **Styled-components / Emotion**:
   - Rejected: Runtime CSS-in-JS has performance cost, not ideal for game UI with frequent updates

**Best Practices**:
- Define semantic tokens in `theme-tokens.ts` (don't hardcode Radix colors in components)
- Use CSS variables for theme switching (change root `--color-*` variables)
- Keep utility classes in components (`.text-primary`, `.bg-surface`) not raw Radix colors
- Document theme tokens in design system (Histoire stories show each theme)

**References**:
- UnoCSS: https://unocss.dev/
- Radix Colors: https://www.radix-ui.com/colors

---

### Decision 6: Histoire for Design System Documentation

**Decision**: Use Histoire (not Storybook) for component documentation

**Rationale**:
- **Vite-native**: Built for Vite (SvelteKit uses Vite), faster dev server startup
- **Lighter**: Smaller bundle than Storybook, simpler configuration
- **Svelte-first**: Better Svelte support than Storybook (which is React-centric)
- **Sufficient features**: Component stories, controls, variants - all needed for design system
- **Requirement**: Need documentation for 50+ components with theme variants

**Alternatives Considered**:
1. **Storybook**:
   - Rejected: Heavier (Webpack-based even with Vite mode), more complex setup, slower
2. **Custom documentation site**:
   - Rejected: More work to build, Histoire provides component controls/variants out of the box

**Best Practices**:
- Create `.story.svelte` file for each component
- Show all theme variants in stories (warrior, mage, rogue, premium)
- Document props with TypeScript + JSDoc comments
- Include interactive controls for props

**References**:
- Histoire: https://histoire.dev/

---

### Decision 7: Server-Authoritative Game Logic

**Decision**: All critical game logic (combat, progression, economy) runs server-side only

**Rationale**:
- **Anti-cheat requirement**: FR-048 requires preventing exploits
- **Game economy**: Auction house, item drops, currency must be trusted
- **Fair play**: Arena combat calculations must be deterministic and server-controlled
- **Client cannot be trusted**: Browser dev tools can modify any client-side code

**Implementation Strategy**:
- **Server logic location**: `server/game/` directory (outside `src/` to prevent client imports)
- **Client role**: Send action requests (e.g., "complete quest", "initiate arena combat")
- **Server validates**: Check prerequisites (quest objectives met, player has currency)
- **Server calculates**: Combat outcomes, XP gains, loot drops
- **Server persists**: Write to database (SQLite)
- **Server broadcasts**: Send result via WebSocket to client

**Example Flow - Quest Completion**:
1. Client: User clicks "Complete Quest" → sends WebSocket message `{ type: "COMPLETE_QUEST", questId: 123 }`
2. Server: Validates user owns active quest 123, objectives are met
3. Server: Calculates rewards (XP, currency, items) using `server/game/quest/rewards.ts`
4. Server: Updates database (mark quest complete, add XP, add items to inventory)
5. Server: Sends WebSocket response `{ type: "QUEST_COMPLETED", payload: { xp: 100, items: [...] } }`
6. Client: Displays reward animation, updates UI from WebSocket payload

**Anti-Cheat Measures**:
- **Input validation**: Server validates all action requests (type checking, range checking)
- **Rate limiting**: Redis-based rate limiting (e.g., max 10 actions/second per user)
- **Audit logging**: Log suspicious activity (e.g., completing quest without prerequisites)
- **Obfuscation**: Don't send sensitive data to client (e.g., enemy HP calculations, loot tables)

**Best Practices**:
- Never trust client-sent values (e.g., damage dealt, XP gained) - server calculates all
- Use TypeScript contracts for client-server messages (`src/lib/types/websocket.ts`)
- Validate request authenticity (session tokens, CSRF for HTTP endpoints)

**References**:
- Valve's Anti-Cheat Architecture: https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
- Server-Authoritative Game Design: https://www.gabrielgambetta.com/client-server-game-architecture.html

---

### Decision 8: TypeScript Strict Mode

**Decision**: Enable TypeScript strict mode across the entire project

**Rationale**:
- **Type safety**: Prevent runtime errors from type mismatches (especially WebSocket messages, API contracts)
- **Refactoring confidence**: Strong types allow safe refactoring of game logic
- **Client-server contracts**: Shared types (`src/lib/types/`) ensure client and server agree on message format
- **Developer experience**: Better autocomplete, inline errors in IDE

**Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Best Practices**:
- Define shared types in `src/lib/types/` (character.ts, quest.ts, websocket.ts, etc.)
- Use Zod or similar for runtime validation of external inputs (WebSocket messages, API requests)
- Avoid `any` - use `unknown` when type is truly unknown, then narrow with type guards

**References**:
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

---

### Decision 9: Vitest + Playwright + Testing Library

**Decision**: Use Vitest for unit/integration tests, Playwright for E2E, Testing Library for component tests

**Rationale**:
- **Vitest**: Vite-native test runner (same config as SvelteKit), fast, Jest-compatible API
- **Playwright**: Cross-browser E2E testing, better than Cypress for SvelteKit
- **Testing Library**: Component testing with user-centric queries (`getByRole`, `getByText`)

**Test Strategy** (per Constitution Principle II):
- **Unit tests**: Game logic (`server/game/`), utilities (`src/lib/utils/`)
- **Integration tests**: API endpoints (`src/routes/api/`), WebSocket handlers
- **Component tests**: UI components (`src/lib/components/`)
- **E2E tests**: Critical user journeys (character creation, questing, arena, auction)

**Best Practices**:
- TDD when tests are required (Red-Green-Refactor)
- Use test factories for creating test data (characters, quests, items)
- Mock external dependencies (database, Redis) in unit tests
- Use Playwright fixtures for E2E setup (create user, login, seed data)

**References**:
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- Testing Library: https://testing-library.com/docs/svelte-testing-library/intro/

---

### Decision 10: Developer Mode

**Decision**: Build developer tools into the application for debugging and testing

**Rationale**:
- **Requirement**: User specified "modo desenvolvedor" for debug and testing
- **Observability**: Constitution Principle V requires transparency and debuggability
- **Development speed**: Faster iteration with built-in tools

**Features**:
1. **Debug Panel** (`src/lib/dev/debug-panel.svelte`):
   - Toggle visibility with keyboard shortcut (e.g., Ctrl+Shift+D)
   - Display current game state (character stats, inventory, active quests)
   - Quick actions (add XP, add items, complete quests)
2. **WebSocket Monitor** (`src/lib/dev/websocket-monitor.svelte`):
   - Log all incoming/outgoing WebSocket messages
   - Filter by message type
   - Replay messages for testing
3. **State Inspector** (`src/lib/dev/state-inspector.svelte`):
   - Visualize Svelte runes state in real-time
   - Edit state values for testing

**Implementation**:
- Wrap dev components in `{#if import.meta.env.DEV}` to exclude from production build
- Use environment variable `VITE_DEV_MODE=true` to enable in production builds for staging

**Security**:
- Dev tools read-only in production (can inspect, not modify)
- Sensitive operations (add items, modify XP) only work in `import.meta.env.DEV`

**References**:
- Vite Env Variables: https://vitejs.dev/guide/env-and-mode.html

---

### Decision 11: Internationalization (i18n) with svelte-i18n

**Decision**: Use svelte-i18n (or sveltekit-i18n) for multi-language support with JSON-based locale files

**Rationale**:
- **Global reach**: Support initial markets (English, Brazilian Portuguese, Spanish) with future expansion (Russian, Chinese, Japanese, Korean)
- **Player accessibility**: Humorous isekai narrative requires proper localization, not just translation
- **Maintainability**: JSON files separate translations from code, translators don't need programming knowledge
- **Type safety**: TypeScript interfaces for translation keys prevent missing translations
- **SEO**: Multi-language support improves discoverability in regional markets

**Initial Languages**:
1. **English (en)**: Primary language, default fallback
2. **Brazilian Portuguese (pt-BR)**: Large gaming market in Brazil
3. **Spanish (es)**: Spanish-speaking markets (Latin America, Spain)

**Future Languages** (prepared structure, translations added later):
4. **Russian (ru)**: Large Eastern European gaming market
5. **Chinese (zh)**: Massive Asian market
6. **Japanese (ja)**: RPG-loving audience, isekai genre origin
7. **Korean (ko)**: Strong gaming culture

**Alternatives Considered**:
1. **Hardcoded strings**:
   - Rejected: Impossible to translate, limits market to English speakers only
2. **Manual template literals**:
   - Rejected: No fallback mechanism, prone to errors, no tooling support
3. **i18next**:
   - Rejected: More complex setup, primarily React-focused, heavier than svelte-i18n

**Implementation Strategy**:
- JSON locale files in `src/i18n/locales/` (e.g., `en.json`, `pt-BR.json`, `es.json`)
- Nested structure: `{ "character": { "create": { "title": "Create Character" } } }`
- Use `$t()` function in components: `$t('character.create.title')`
- Store user locale preference in localStorage + database (character preference)
- Server-side locale detection from Accept-Language header (initial load)
- Language selector in UI (dropdown with flag icons)

**Translation Workflow**:
1. Developer writes English strings in `en.json`
2. Export translation keys to spreadsheet (CSV) for translators
3. Translators fill in other languages
4. Import translated CSV back to JSON files
5. CI/CD validates all locale files have matching keys

**Special Considerations for Game Content**:
- **Quest narratives**: Require cultural adaptation, not literal translation (humor varies by culture)
- **Character class names**: Keep consistent (Warrior, Mage, Rogue) or localize (Guerreiro, Mago, Ladino)?
  - Decision: Localize for immersion, maintain English internal IDs
- **Item descriptions**: Localize flavor text, keep stats/numbers consistent
- **UI text**: Standard translations
- **Error messages**: Localized for better UX

**Best Practices**:
- Use ICU MessageFormat for pluralization: `{ count, plural, one {# item} other {# items} }`
- Support RTL languages (future): Arabic, Hebrew (requires CSS direction changes)
- Avoid concatenation: Use placeholders `"Welcome, {username}!"` not `"Welcome, " + username`
- Date/time formatting: Use Intl.DateTimeFormat for locale-aware dates
- Number formatting: Use Intl.NumberFormat for currency (10,000 vs 10.000)

**References**:
- svelte-i18n: https://github.com/kaisermann/svelte-i18n
- sveltekit-i18n: https://github.com/jarda-svoboda/sveltekit-i18n
- ICU MessageFormat: https://formatjs.io/docs/core-concepts/icu-syntax/

---

## Architectural Patterns

### Pattern 1: Repository Pattern for Data Access

**Pattern**: Use repository classes to abstract database operations

**Rationale**:
- **Testability**: Can mock repositories in tests without touching database
- **Maintainability**: Centralize SQL queries, easier to optimize or migrate database
- **Type safety**: Repositories return strongly-typed entities

**Example**:
```typescript
// server/database/repositories/character.ts
export class CharacterRepository {
  constructor(private db: Database) {}

  findById(id: number): Character | null {
    return this.db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  }

  create(data: CreateCharacterDto): Character {
    const result = this.db.prepare('INSERT INTO characters (...) VALUES (...)').run(data);
    return this.findById(result.lastInsertRowid)!;
  }

  // ... other methods
}
```

---

### Pattern 2: Message-Driven WebSocket Architecture

**Pattern**: WebSocket messages follow a type-driven command pattern

**Rationale**:
- **Type safety**: Each message type has a defined payload shape
- **Extensibility**: Easy to add new message types
- **Centralized handling**: Single message router dispatches to handlers

**Example**:
```typescript
// src/lib/types/websocket.ts
type WebSocketMessage =
  | { type: 'COMPLETE_QUEST', payload: { questId: number } }
  | { type: 'QUEST_COMPLETED', payload: { quest: Quest, rewards: Rewards } }
  | { type: 'INITIATE_ARENA', payload: { characterId: number } }
  | { type: 'ARENA_RESULT', payload: { combat: CombatResult } };

// server/websocket/handlers/index.ts
const handlers = {
  COMPLETE_QUEST: handleCompleteQuest,
  INITIATE_ARENA: handleInitiateArena,
  // ...
};

export function handleMessage(ws: WebSocket, message: WebSocketMessage) {
  const handler = handlers[message.type];
  if (handler) handler(ws, message.payload);
}
```

---

## Open Questions & Future Research

### Question 1: WebSocket Library Choice

**Question**: Should we use native WebSocket API or Socket.IO?

**Initial Decision**: Start with native WebSocket for simplicity

**Revisit When**:
- If we need advanced features (rooms, namespaces, automatic reconnection)
- If native WebSocket reconnection logic becomes complex
- After implementing initial WebSocket handler, evaluate if Socket.IO would simplify

---

### Question 2: Database Migration System

**Question**: Which migration tool for SQLite?

**Options**:
1. Custom script (simple, lightweight)
2. node-sqlite3-migrate
3. Knex.js migrations

**Recommendation**: Start with custom script (just SQL files + version table), migrate to tool if needed

---

### Question 3: Asset Storage

**Question**: Where to store AI-generated images and audio?

**Options**:
1. `static/` folder (simple, works for initial development)
2. CDN (Cloudflare, AWS S3) for production
3. Hybrid: static for development, CDN for production

**Recommendation**: Start with `static/`, add CDN later when asset volume grows

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|--------------|--------|---------------|
| Framework | SvelteKit + Svelte 5 | Full-stack, modern reactivity, performance |
| Real-time | WebSocket + Redis pub/sub | <50ms latency, server-to-client push, scaling |
| Database | SQLite + better-sqlite3 | Simplicity, sufficient scale, ACID transactions |
| Caching | Redis (ioredis) | Session state, pub/sub, leaderboards, TTL |
| Styling | UnoCSS + Radix Colors | Dynamic theming, accessibility, performance |
| Design System Docs | Histoire | Vite-native, lightweight, Svelte-first |
| Architecture | Server-authoritative | Anti-cheat, trusted game economy |
| Type Safety | TypeScript strict | Runtime safety, refactoring confidence |
| Testing | Vitest + Playwright + Testing Library | Vite-native, comprehensive coverage |
| Developer Tools | Built-in dev mode | Debugging, observability, fast iteration |
| i18n | svelte-i18n with JSON locales | Global reach, 7 languages (3 initial + 4 future) |

**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
