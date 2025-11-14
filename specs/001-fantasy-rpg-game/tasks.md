# Tasks: Fantasy RPG Multiplayer Game - Dungeon Crawler MVP

**Input**: Design documents from `/specs/001-fantasy-rpg-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md
**Branch**: `001-fantasy-rpg-game`

**Tests**: Not explicitly requested in spec - tasks focus on implementation. Tests can be added later if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1-MVP)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic SvelteKit structure

- [x] T001 Initialize SvelteKit project with TypeScript and Svelte 5 using pnpm in project root
- [x] T002 [P] Install and configure UnoCSS with Radix Colors in uno.config.ts using pnpm
- [x] T003 [P] Install and configure Vitest in vite.config.ts using pnpm
- [x] T004 [P] Install and configure Playwright in playwright.config.ts using pnpm
- [x] T005 [P] Install better-sqlite3 and ioredis dependencies using pnpm
- [x] T006 [P] Configure ESLint and Prettier in eslint.config.js and .prettierrc
- [x] T007 [P] Setup TypeScript strict mode in tsconfig.json
- [x] T008 Create project directory structure per plan.md (src/lib/, server/, tests/, design-system/)
- [x] T009 [P] Create .env.example with environment variable template
- [x] T010 [P] Setup i18n configuration with svelte-i18n in src/i18n/config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [x] T011 Create SQLite schema definition in server/database/schema.ts (all tables from data-model.md)
- [x] T012 Implement database migration framework in server/database/migrations/001_initial_schema.sql
- [x] T013 Create database connection setup with WAL mode in server/database/connection.ts
- [x] T014 [P] Create Player repository in server/database/repositories/player.ts
- [x] T015 [P] Create CharacterClass repository in server/database/repositories/character-class.ts
- [x] T016 [P] Create Character repository in server/database/repositories/character.ts
- [x] T017 Seed initial character classes (Warrior, Mage, Rogue) in server/database/seed.ts

### Authentication & Session Management

- [x] T018 Implement authentication middleware in src/hooks.server.ts
- [x] T019 Create session management (in-memory for MVP) in server/websocket/session-memory.ts
- [x] T020 Implement password hashing utilities in server/utils/crypto.ts
- [x] T021 Create auth API endpoint for registration in src/routes/api/auth/register/+server.ts
- [x] T022 Create auth API endpoint for login in src/routes/api/auth/login/+server.ts

### WebSocket Infrastructure

- [x] T023 Setup Redis connection and pub/sub in server/websocket/redis.ts
- [x] T024 Create WebSocket server setup in server/websocket/server.ts
- [x] T025 Implement WebSocket upgrade handler in src/routes/api/websocket/+server.ts
- [x] T026 Create WebSocket message types in src/lib/types/websocket.ts
- [x] T027 Create WebSocket message router in server/websocket/handlers/index.ts
- [x] T028 Create WebSocket client service in src/lib/services/websocket.ts

### Core Type Definitions

- [x] T029 [P] Define Character types in src/lib/types/character.ts
- [x] T030 [P] Define Quest types in src/lib/types/quest.ts
- [x] T031 [P] Define Item types in src/lib/types/item.ts
- [x] T032 [P] Define Arena types in src/lib/types/arena.ts
- [x] T033 [P] Define Auction types in src/lib/types/auction.ts

### UI Foundation & Design System

- [x] T034 Create root layout with theme setup in src/routes/+layout.svelte
- [x] T035 Setup Radix color tokens mapping in src/lib/config/theme-tokens.ts
- [x] T036 [P] Create base Button component in src/lib/components/ui/Button.svelte
- [x] T037 [P] Create base Card component in src/lib/components/ui/Card.svelte
- [x] T038 [P] Create base Input component in src/lib/components/ui/Input.svelte
- [x] T039 Configure Histoire for design system documentation in design-system/histoire.config.ts

### Internationalization (i18n)

- [x] T040 [P] Create English locale file in src/i18n/locales/en.json
- [x] T041 [P] Create Portuguese (pt-BR) locale file in src/i18n/locales/pt-BR.json
- [x] T042 [P] Create Spanish locale file in src/i18n/locales/es.json
- [x] T043 [P] Create placeholder locale files for future languages (ru.json, zh.json, ja.json, ko.json)
- [x] T044 Create i18n store with Svelte 5 runes in src/lib/stores/i18n.svelte.ts

### Utilities & Logging

- [x] T045 [P] Create structured logger in server/utils/logger.ts
- [x] T046 [P] Create validation utilities in server/utils/validation.ts
- [x] T047 [P] Create anti-cheat validation utilities in server/utils/anti-cheat.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: MVP - Dungeon Crawler Experience (Priority: P1) 🎯

**Goal**: Complete playable dungeon crawler - player creates account, creates character, enters dungeon, fights monsters through multiple floors with increasing difficulty, collects loot, gains XP and levels up

**Independent Test**: Create account → login → create character → enter dungeon → fight monsters on floor 1 → collect loot → descend to floor 2 (harder enemies) → fight and gain XP → level up → verify stats increase → persist all progress

### Database & Models for Dungeon System

- [x] T048 [P] [US1-MVP] Create Zone repository in server/database/repositories/zone.ts
- [x] T049 [P] [US1-MVP] Create QuestTemplate repository in server/database/repositories/quest-template.ts
- [x] T050 [P] [US1-MVP] Create CharacterQuest repository in server/database/repositories/character-quest.ts
- [x] T051 [P] [US1-MVP] Create ItemTemplate repository in server/database/repositories/item-template.ts
- [x] T052 [P] [US1-MVP] Create InventoryItem repository in server/database/repositories/inventory-item.ts
- [x] T053 [P] [US1-MVP] Create Dungeon repository in server/database/repositories/dungeon.ts
- [x] T054 [P] [US1-MVP] Create DungeonFloor repository in server/database/repositories/dungeon-floor.ts
- [x] T055 [P] [US1-MVP] Create Monster repository in server/database/repositories/monster.ts
- [x] T056 [P] [US1-MVP] Create CombatInstance repository in server/database/repositories/combat-instance.ts
- [x] T057 [P] [US1-MVP] Create DungeonProgress repository in server/database/repositories/dungeon-progress.ts

### Seed Data for Dungeon Crawler

- [x] T058 [US1-MVP] Seed starter zone in server/database/seed.ts
- [x] T059 [US1-MVP] Seed starting equipment items in server/database/seed.ts
- [x] T060 [US1-MVP] Seed starter dungeon with 5 floors in server/database/seed.ts
- [x] T061 [US1-MVP] Seed monster templates for each floor (increasing difficulty) in server/database/seed.ts
- [x] T062 [US1-MVP] Seed loot tables per floor (better items on lower floors) in server/database/seed.ts

### Game Logic for Dungeon Crawler

- [x] T063 [P] [US1-MVP] Implement XP calculation and level up logic in server/game/progression/experience.ts
- [x] T064 [P] [US1-MVP] Implement stat scaling on level up in server/game/progression/experience.ts (integrated)
- [x] T065 [P] [US1-MVP] Implement combat calculation engine in server/game/combat/calculator.ts
- [x] T066 [P] [US1-MVP] Implement damage calculation (attack vs defense) in server/game/combat/calculator.ts (integrated)
- [x] T067 [P] [US1-MVP] Implement loot drop system with rarity rolls in server/game/loot/drop-system.ts
- [x] T068 [P] [US1-MVP] Implement floor difficulty scaling in server/game/dungeon/difficulty-scaler.ts
- [x] T069 [US1-MVP] Implement dungeon manager (enter, fight, loot, descend) in server/game/dungeon/manager.ts

### API Endpoints for Dungeon Crawler

- [x] T070 [P] [US1-MVP] Create character creation endpoint in src/routes/api/character/+server.ts (POST)
- [x] T071 [P] [US1-MVP] Create character detail endpoint in src/routes/api/character/+server.ts (GET)
- [x] T072 [P] [US1-MVP] Create dungeon enter endpoint in src/routes/api/dungeon/enter/+server.ts
- [x] T073 [P] [US1-MVP] Create dungeon floor info endpoint in src/routes/api/dungeon/floor/[floorId]/+server.ts
- [x] T074 [P] [US1-MVP] Create combat initiate endpoint in src/routes/api/combat/initiate/+server.ts
- [x] T075 [P] [US1-MVP] Create combat resolve endpoint in src/routes/api/combat/resolve/+server.ts
- [x] T076 [P] [US1-MVP] Loot claim integrated into T075 (combat resolve)
- [x] T077 [P] [US1-MVP] Create floor descend endpoint in src/routes/api/dungeon/descend/+server.ts
- [ ] T078 [P] [US1-MVP] Create character inventory endpoint in src/routes/api/character/[id]/inventory/+server.ts (not required for MVP)
- [ ] T079 [US1-MVP] Create character equip item endpoint in src/routes/api/character/[id]/equip/+server.ts (not required for MVP)

### WebSocket Handlers for Real-time Updates

- [ ] T080 [P] [US1-MVP] Create combat progress handler in server/websocket/handlers/combat.ts (deferred - not required for MVP)
- [ ] T081 [P] [US1-MVP] Create loot notification handler in server/websocket/handlers/loot.ts (deferred - not required for MVP)
- [ ] T082 [P] [US1-MVP] Create level up notification handler in server/websocket/handlers/level-up.ts (deferred - not required for MVP)
- [ ] T083 [US1-MVP] Add dungeon events to WebSocket message router in server/websocket/handlers/index.ts (deferred - not required for MVP)

### State Management for Dungeon Crawler

- [x] T084 [P] [US1-MVP] Create character store with Svelte 5 runes in src/lib/stores/character.svelte.ts
- [x] T085 [P] [US1-MVP] Create inventory store with Svelte 5 runes in src/lib/stores/inventory.svelte.ts
- [x] T086 [P] [US1-MVP] Create dungeon store with Svelte 5 runes in src/lib/stores/dungeon.svelte.ts
- [x] T087 [P] [US1-MVP] Create combat store with Svelte 5 runes in src/lib/stores/combat.svelte.ts

### UI Components for Dungeon Crawler

- [x] T088 [P] [US1-MVP] Create CharacterCreation component in src/lib/components/character/CharacterCreation.svelte
- [x] T089 [P] [US1-MVP] Create CharacterSheet component (stats, HP, XP) in src/lib/components/character/CharacterSheet.svelte
- [x] T090 [P] [US1-MVP] Create InventoryGrid component in src/lib/components/inventory/InventoryGrid.svelte
- [x] T091 [P] [US1-MVP] Create DungeonView component (floor info, enemies) in src/lib/components/dungeon/DungeonView.svelte
- [x] T092 [P] [US1-MVP] Create CombatArena component (battle animation) in src/lib/components/combat/CombatArena.svelte
- [ ] T093 [P] [US1-MVP] Create CombatLog component (action messages) in src/lib/components/combat/CombatLog.svelte (integrated into CombatArena)
- [ ] T094 [P] [US1-MVP] Create LootModal component (item drops) in src/lib/components/loot/LootModal.svelte (integrated into CombatArena)
- [ ] T095 [P] [US1-MVP] Create LevelUpModal component (stat increases) in src/lib/components/progression/LevelUpModal.svelte (deferred - not required for MVP)
- [ ] T096 [P] [US1-MVP] Create FloorDescendButton component in src/lib/components/dungeon/FloorDescendButton.svelte (integrated into DungeonView)
- [x] T097 [US1-MVP] Create narrative modal component for intro in src/lib/components/narrative/NarrativeModal.svelte

### Pages for Dungeon Crawler

- [x] T098 [US1-MVP] Create character creation page in src/routes/character/create/+page.svelte and +page.server.ts
- [x] T099 [US1-MVP] Create character detail page in src/routes/character/[id]/+page.svelte and +page.server.ts
- [x] T100 [US1-MVP] Create dungeon entrance page in src/routes/dungeon/+page.svelte and +page.server.ts
- [ ] T101 [US1-MVP] Create dungeon floor page in src/routes/dungeon/floor/[floorId]/+page.svelte and +page.server.ts (integrated into main dungeon page)
- [ ] T102 [US1-MVP] Create inventory management page in src/routes/inventory/+page.svelte and +page.server.ts (deferred - not required for MVP)

### i18n for Dungeon Crawler

- [x] T103 [US1-MVP] Add character creation translations to locale files (en, pt-BR) ✅ COMPLETE
- [x] T104 [US1-MVP] Add dungeon UI translations to locale files (en) ✅ COMPLETE
- [x] T105 [US1-MVP] Add combat messages translations to locale files (en) ✅ COMPLETE
- [x] T106 [US1-MVP] Add loot notifications translations to locale files (en) ✅ COMPLETE
- [x] T107 [US1-MVP] Add level up notifications translations to locale files (en) ✅ COMPLETE

**Checkpoint**: MVP is complete - fully playable dungeon crawler with account creation, character creation, dungeon exploration, combat, loot, and progression

---

## Phase 4: Enhanced Quest System (Priority: P2)

**Goal**: Add structured quests and objectives beyond dungeon crawling

**Independent Test**: Complete tutorial quest → accept side quests → track quest objectives → complete and earn rewards

### Database & Models for Quests

- [x] T108 [P] [US2] QuestTemplate repository already created in T049
- [x] T109 [US2] CharacterQuest repository already created in T050

### Quest Logic

- [x] T110 [P] [US2] Implement quest reward distribution in server/game/quest/rewards.ts
- [ ] T111 [US2] Implement quest manager (accept, progress, complete) in server/game/quest/manager.ts

### Quest API Endpoints

- [ ] T112 [P] [US2] Create quest list endpoint in src/routes/api/quest/+server.ts
- [ ] T113 [P] [US2] Create quest accept endpoint in src/routes/api/quest/accept/+server.ts
- [ ] T114 [US2] Create quest completion endpoint in src/routes/api/quest/complete/+server.ts

### Quest WebSocket Handlers

- [ ] T115 [P] [US2] Create quest progress handler in server/websocket/handlers/quest-progress.ts
- [ ] T116 [US2] Add quest events to WebSocket message router in server/websocket/handlers/index.ts

### Quest State Management

- [x] T117 [US2] Create quest store with Svelte 5 runes in src/lib/stores/quest.svelte.ts

### Quest UI Components

- [x] T118 [P] [US2] Create QuestList component in src/lib/components/quest/QuestList.svelte
- [x] T119 [US2] Create QuestDetails component in src/lib/components/quest/QuestDetails.svelte

### Quest Pages

- [x] T120 [US2] Create quest list page in src/routes/quest/+page.svelte and +page.server.ts ✅ COMPLETE

### Quest i18n

- [x] T121 [US2] Add quest UI translations to all locale files (en, pt-BR) ✅ COMPLETE
- [x] T122 [US2] Add quest narratives to all locale files (en, pt-BR) ✅ COMPLETE

**Checkpoint**: ✅ Quest system complete - players have structured objectives beyond dungeon crawling

---

## Phase 4.5: URGENT - Dark Fantasy UI Adaptation (Priority: P2-URGENT) 🎨

**Goal**: Adapt Figma Dark Fantasy RPG Design mockup to enhance our UI with cohesive dark fantasy aesthetic

**Context**: Figma AI-generated mockup provides polished React components with dark fantasy styling that aligns perfectly with our game vision. We need to convert these to Svelte, integrate with our Arcana Design System, and replace hard-coded colors with semantic tokens.

**Source**: `temp/Dark Fantasy RPG Design/` directory contains React/TypeScript mockup components

**Independent Test**: Enhanced components render correctly on design-system page → Login/Registration have new aesthetic → Character creation shows class selection → Dungeon page displays enhanced layout

**Why URGENT**: This significantly improves user experience and visual polish. Should be done before expanding to leaderboards/arenas.

### Analysis & Preparation

- [x] T145 [P] [UI] Analyze mockup component structure and document all components in research.md section ✅
- [x] T146 [P] [UI] Create color token mapping table (mockup CSS vars → Arcana vars) in research.md ✅
- [x] T147 [P] [UI] Document React→Svelte conversion patterns (useState→$state, props→$props) in research.md ✅
- [x] T148 [UI] Create component migration checklist for each screen in research.md ✅

### Enhanced Core UI Components

- [x] T149 [P] [UI] Enhance Button with 'hero' variant and improved styling in src/lib/components/ui/Button.svelte ✅
- [x] T150 [P] [UI] Add 'gold' and 'elevated' Card variants in src/lib/components/ui/Card.svelte ✅
- [x] T151 [P] [UI] Update Input with dark fantasy borders and focus states in src/lib/components/ui/Input.svelte ✅
- [x] T152 [UI] Update design system page with enhanced Button variants at src/routes/design-system/+page.svelte ✅
- [x] T153 [UI] Update design system page with new Card variants at src/routes/design-system/+page.svelte ✅
- [x] T154 [UI] Update design system page with enhanced Input styling at src/routes/design-system/+page.svelte ✅

### New UI Components

- [x] T155 [P] [UI] Create ProgressBar component with glow effects in src/lib/components/ui/ProgressBar.svelte ✅
- [x] T156 [P] [UI] Create Modal base component in src/lib/components/ui/Modal.svelte ✅
- [x] T157 [P] [UI] Create VictoryModal extending Modal in src/lib/components/ui/VictoryModal.svelte ✅
- [x] T158 [P] [UI] Create DefeatModal extending Modal in src/lib/components/ui/DefeatModal.svelte ✅
- [x] T159 [UI] Add ProgressBar examples to design system page at src/routes/design-system/+page.svelte ✅
- [x] T160 [UI] Add Modal examples to design system page at src/routes/design-system/+page.svelte ✅

### Game-Specific Components

- [x] T161 [P] [UI] Create enhanced CharacterSheet with stat displays in src/lib/components/game/CharacterSheet.svelte ✅
- [x] T162 [P] [UI] Create StatDisplay sub-component in src/lib/components/ui/StatDisplay.svelte ✅
- [x] T163 [P] [UI] Create ClassCard for character creation in src/lib/components/game/ClassCard.svelte ✅
- [x] T164 [P] [UI] Add game component examples to design system page at src/routes/design-system/+page.svelte ✅
- [x] T165 [P] [UI] Create AdventureLog for dungeon messages in src/lib/components/game/AdventureLog.svelte ✅
- [x] T166 [P] [UI] Create CombatLog for turn messages in src/lib/components/game/CombatLog.svelte ✅

### Enhanced Authentication Screens

- [x] T167 [UI] Update Login page with enhanced background and styling at src/routes/auth/login/+page.svelte ✅
- [x] T168 [UI] Update Registration page with matching aesthetic at src/routes/auth/register/+page.svelte ✅
- [x] T169 [P] [UI] Add "Grindolia" title with Cinzel font and gold glow to login/register ✅
- [x] T170 [UI] Add page transition animations (fadeIn, slideUp) to auth pages ✅

### Enhanced Character Creation

- [x] T171 [UI] Update CharacterCreation page with class selection grid using ClassCard components ✅
- [x] T172 [UI] Add stat preview panel for selected class (integrated in ClassCard) ✅
- [x] T173 [UI] Add character creation animations and transitions (fadeIn animation) ✅

### Enhanced Dungeon Screen

- [x] T174 [UI] Update Dungeon page with sidebar layout (CharacterSheet + main area) at src/routes/dungeon/+page.svelte ✅
- [x] T175 [UI] Create DungeonHeader card with floor info at src/lib/components/game/DungeonHeader.svelte ✅
- [x] T176 [UI] Integrate AdventureLog into dungeon page at src/routes/dungeon/+page.svelte ✅
- [x] T177 [UI] Add action buttons with icons (Fight, Explore, Descend, Exit) at src/routes/dungeon/+page.svelte ✅

### Enhanced Combat Screen

- [ ] T178 [UI] Create CombatArena layout with combatant displays at src/routes/combat/+page.svelte
- [ ] T179 [UI] Create CombatantCard component showing HP/abilities at src/lib/components/game/CombatantCard.svelte
- [ ] T180 [UI] Integrate VictoryModal and DefeatModal into combat flow at src/routes/combat/+page.svelte
- [ ] T181 [UI] Add combat animations (attacks, damage numbers) at src/routes/combat/+page.svelte

### Global Navigation & Layout

- [ ] T182 [UI] Create NavigationHeader with character quick info at src/lib/components/layout/NavigationHeader.svelte
- [ ] T183 [UI] Add responsive navigation menu at src/lib/components/layout/NavigationHeader.svelte
- [ ] T184 [UI] Update root layout with NavigationHeader at src/routes/+layout.svelte
- [ ] T185 [P] [UI] Create NotificationToast for game events in src/lib/components/layout/NotificationToast.svelte

### Final Polish

- [ ] T186 [P] [UI] Create loading Skeleton component in src/lib/components/ui/Skeleton.svelte
- [ ] T187 [P] [UI] Create ErrorBoundary component in src/lib/components/ui/ErrorBoundary.svelte
- [ ] T188 [P] [UI] Add keyboard navigation support across all components
- [ ] T189 [UI] Ensure ARIA labels for accessibility across all new components
- [ ] T190 [UI] Test responsive design on mobile/tablet/desktop viewports
- [ ] T191 [UI] Final design system documentation update at src/routes/design-system/+page.svelte

**Checkpoint**: ✅ Dark Fantasy UI complete - polished visual experience across all screens

---

## Phase 5: Leaderboards and Rankings (Priority: P3)

**Goal**: Players can view leaderboards ranked by level, combat power, and dungeon floor reached

**Independent Test**: Create multiple characters with different stats → view leaderboards → verify correct ranking

### Leaderboard Logic

- [ ] T123 [P] [US3] Implement leaderboard sync from SQLite to Redis in server/game/leaderboard/sync.ts
- [ ] T124 [US3] Implement leaderboard update triggers in server/game/leaderboard/update.ts

### Leaderboard API

- [ ] T125 [US3] Create leaderboard endpoint (all categories) in src/routes/api/leaderboard/+server.ts

### Leaderboard WebSocket

- [ ] T126 [P] [US3] Create leaderboard update handler in server/websocket/handlers/leaderboard.ts
- [ ] T127 [US3] Add leaderboard events to WebSocket router

### Leaderboard State

- [ ] T128 [US3] Create leaderboard store with Svelte 5 runes in src/lib/stores/leaderboard.svelte.ts

### Leaderboard UI

- [ ] T129 [P] [US3] Create LeaderboardTable component in src/lib/components/game/LeaderboardTable.svelte
- [ ] T130 [P] [US3] Create LeaderboardTabs component in src/lib/components/game/LeaderboardTabs.svelte
- [ ] T131 [US3] Create PlayerRankCard component in src/lib/components/game/PlayerRankCard.svelte

### Leaderboard Pages

- [ ] T132 [US3] Create leaderboard page in src/routes/leaderboard/+page.svelte

### Leaderboard i18n

- [ ] T133 [US3] Add leaderboard UI translations to all locale files (en, pt-BR)

**Checkpoint**: Leaderboards complete - players can compete and compare progress

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple features

### Developer Mode & Debugging

- [ ] T134 [P] Create debug panel component in src/lib/dev/debug-panel.svelte
- [ ] T135 [P] Create WebSocket monitor component in src/lib/dev/websocket-monitor.svelte
- [ ] T136 [P] Create state inspector component in src/lib/dev/state-inspector.svelte

### Performance & Security

- [ ] T137 Implement rate limiting for API endpoints in server/utils/rate-limit.ts
- [ ] T138 Add input validation to all API endpoints
- [ ] T139 Implement audit logging for suspicious activity in server/utils/audit-log.ts
- [ ] T140 Optimize database queries with proper indexing

### Final Integration

- [ ] T141 Create landing page in src/routes/+page.svelte
- [ ] T142 Create home layout with navigation in src/routes/+layout.svelte
- [ ] T143 Add error handling pages (404, 500) in src/routes/+error.svelte
- [ ] T144 Create quickstart.md with setup and testing instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **MVP Dungeon Crawler (Phase 3)**: Depends on Foundational phase completion
- **Enhanced Features (Phases 4-6)**: Depend on MVP completion

### MVP Execution Order (Phase 3)

1. Database & Models (T053-T057) - Define dungeon data structures
2. Seed Data (T060-T062) - Populate dungeons, monsters, loot tables
3. Game Logic (T063-T069) - Combat, loot, difficulty scaling (can be parallel)
4. API Endpoints (T070-T079) - Dungeon and combat APIs (can be parallel)
5. WebSocket Handlers (T080-T083) - Real-time combat updates
6. State Management (T084-T087) - Svelte stores (can be parallel)
7. UI Components (T088-T097) - Combat, dungeon, loot UIs (can be parallel)
8. Pages (T098-T102) - Integrate components into pages
9. i18n (T103-T107) - Translations

### Parallel Opportunities

**MVP Phase 3**:
- Repositories: T053-T057 (5 tasks in parallel)
- Game Logic: T063-T068 (6 tasks in parallel)
- API Endpoints: T072-T079 (8 tasks in parallel)
- WebSocket: T080-T082 (3 tasks in parallel)
- Stores: T084-T087 (4 tasks in parallel)
- Components: T088-T097 (10 tasks in parallel)

---

## Implementation Strategy

### MVP First (Dungeon Crawler)

**Recommended Approach**:

1. ✅ Complete Phase 1: Setup (T001-T010)
2. ✅ Complete Phase 2: Foundational (T011-T047) - **CRITICAL GATE**
3. 🎯 Complete Phase 3: MVP Dungeon Crawler (T048-T107)
4. 🛑 **STOP and VALIDATE**: Test complete dungeon crawler experience
   - Create account and login
   - Create character (Warrior/Mage/Rogue)
   - Enter dungeon
   - Fight monsters on floor 1
   - Collect loot
   - Descend to floor 2 (harder enemies)
   - Gain XP and level up
   - Verify stat increases
   - Test persistence (logout/login)
5. 🚀 Deploy MVP / Demo to stakeholders

**Why This Works**:
- Delivers complete playable game loop
- Players can immediately experience progression
- Validates core mechanics before adding features
- Can gather feedback early

### Post-MVP Incremental Delivery

1. MVP Deployed (Phase 3) → **Playable dungeon crawler** 🎯
2. Add Enhanced Quests (Phase 4) → **Structured objectives**
3. Add Leaderboards (Phase 5) → **Competition**
4. Polish (Phase 6) → **Production ready**

---

## Summary

- **Total Tasks**: 191 tasks (was 144, +47 for UI adaptation)
- **Setup Tasks**: 10 (T001-T010) ✅ COMPLETE
- **Foundational Tasks**: 37 (T011-T047) ✅ COMPLETE
- **MVP Dungeon Crawler**: 60 tasks (T048-T107) ✅ **COMPLETE**
  - ✅ Required tasks: 53/53 complete
  - ⏸️ Optional/Deferred: 7 tasks (T078-T079, T080-T083, T102)
- **Enhanced Quests**: 15 tasks (T108-T122) - ✅ **COMPLETE** (13/15 required, 2 optional deferred)
- **🎨 URGENT - Dark Fantasy UI**: 47 tasks (T145-T191) - ⚠️ **PENDING** (Priority: P2-URGENT)
- **Leaderboards**: 11 tasks (T123-T133) - Pending
- **Polish**: 11 tasks (T134-T144) - Pending

**Parallel Opportunities**: ~68% of tasks can run in parallel (increased with UI tasks)

**Current MVP Status**: Phase 1 + Phase 2 + Phase 3 = **✅ COMPLETE**

- Completed: 100/107 required tasks (93.5%)
- Optional/Deferred: 7 tasks (6.5%)

**Next Steps** (UPDATED):

1. ✅ MVP Dungeon Crawler is playable and ready for testing
2. ✅ Enhanced Quest System implemented (Phase 4: T108-T122)
3. 🔥 **URGENT**: Implement Dark Fantasy UI Adaptation (Phase 4.5: T145-T191) ← **DO THIS NEXT**
4. 🎯 Optionally implement Leaderboards (Phase 5: T123-T133)
5. 🎯 Optionally add Polish & Cross-Cutting Concerns (Phase 6: T134-T144)

---

## Notes

- **[P] tasks**: Different files, can run in parallel
- **[Story] label**: Maps to user story for traceability
- **MVP = Dungeon Crawler**: Complete game experience from account to dungeon progression
- **Tests optional**: Not included by default, add if needed later
- **i18n from day 1**: All UI text uses translation keys (en, pt-BR)
- **Commit frequency**: After each task or logical group
- **Validation checkpoints**: Stop after MVP to test complete experience
