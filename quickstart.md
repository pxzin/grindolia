# Grindolia - Quick Start Guide

A dark fantasy multiplayer RPG built with SvelteKit, SQLite, Redis, and WebSocket.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (or npm/yarn)
- **Redis** 6+ (for real-time features and leaderboards)
- **SQLite** 3+ (bundled with Node.js)

## Quick Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Redis (Required)

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Verify Redis:**
```bash
redis-cli ping
# Should respond: PONG
```

### 3. Initialize Database

The database will be automatically created on first run at `data/grindolia.db`.

To manually seed with test data:
```bash
pnpm exec tsx server/database/seed.ts
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at: **http://localhost:5173**

## Testing the Game

### 1. Create an Account

- Navigate to http://localhost:5173
- Click "Begin Your Journey"
- Register with email, username, and password

### 2. Create a Character

- Choose a class (Warrior, Mage, Rogue, Cleric)
- Enter a character name
- Click "Begin Adventure"

### 3. Explore Features

**Dungeon Crawler:**
- Visit `/dungeon` to enter dungeons
- Fight monsters, collect loot, and level up
- Descend to deeper floors for greater challenges

**Leaderboards:**
- Visit `/leaderboard` to compete globally
- Track rankings by Level, Combat Power, or Dungeon Progress

**Character Management:**
- View your character sheet
- Track stats, HP, XP, and gold
- Monitor quest progress

### 4. Developer Tools (DEV Mode)

Press the **bug icon** in the bottom-right corner to access:
- **Character Inspector**: View/modify character state
- **Leaderboard Monitor**: Debug leaderboard data
- **Quick Actions**: Add gold, XP, heal, level up

## Architecture Overview

### Frontend (SvelteKit)

- **Svelte 5** with runes (`$state`, `$derived`, `$props`)
- **UnoCSS** for utility-first styling
- **Arcana Design System** for dark fantasy theming
- **lucide-svelte** for icons
- **svelte-i18n** for internationalization

### Backend

- **Node.js** with TypeScript
- **SQLite** for persistent storage
- **Redis** for caching and leaderboards
- **WebSocket** for real-time updates
- **better-sqlite3** for database access

### Key Directories

```
grindolia/
├── src/
│   ├── routes/          # SvelteKit pages
│   │   ├── api/         # API endpoints
│   │   ├── auth/        # Authentication pages
│   │   ├── character/   # Character creation
│   │   ├── dungeon/     # Dungeon crawler
│   │   └── leaderboard/ # Rankings
│   ├── lib/
│   │   ├── components/  # Reusable components
│   │   │   ├── ui/      # UI primitives
│   │   │   ├── game/    # Game-specific components
│   │   │   └── layout/  # Layout components
│   │   ├── stores/      # Svelte 5 stores
│   │   └── dev/         # Developer tools
│   └── i18n/            # Translations (en, pt-BR)
├── server/
│   ├── database/        # SQLite schema & repositories
│   ├── game/            # Game logic
│   │   ├── combat/      # Combat calculator
│   │   ├── dungeon/     # Dungeon manager
│   │   ├── leaderboard/ # Ranking system
│   │   └── quest/       # Quest system
│   ├── websocket/       # WebSocket server
│   └── utils/           # Utilities (logging, validation)
└── specs/               # Project documentation
```

## Common Tasks

### Build for Production

```bash
pnpm build
pnpm preview
```

### Run Tests (when available)

```bash
pnpm test
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Database Management

**View database:**
```bash
sqlite3 data/grindolia.db
```

**Reset database:**
```bash
rm data/grindolia.db
pnpm exec tsx server/database/seed.ts
```

### Optimize Database

```bash
pnpm exec tsx -e "import('./server/database/optimize.js').then(m => m.optimizeDatabase())"
```

## Environment Variables

Create a `.env` file (optional):

```env
# Redis connection
REDIS_URL=redis://localhost:6379

# WebSocket server
WS_PORT=3001

# Session secret (auto-generated if not set)
SESSION_SECRET=your-secret-key-here

# Database path
DB_PATH=./data/grindolia.db
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Character

- `POST /api/character` - Create character
- `GET /api/character/:id` - Get character data

### Leaderboard

- `GET /api/leaderboard?category=level` - Get rankings
  - Categories: `level`, `combatPower`, `dungeonFloor`
  - Query params: `start`, `count`, `characterId`

### Dungeon

- `POST /api/dungeon/enter` - Enter dungeon
- `POST /api/dungeon/descend` - Descend to next floor
- `POST /api/dungeon/combat/start` - Start combat
- `POST /api/dungeon/combat/action` - Perform combat action

## WebSocket Events

### Client → Server

- `leaderboard:request` - Request leaderboard data
- `quest:progress` - Report quest progress

### Server → Client

- `leaderboard:update` - Leaderboard changed
- `character:level_up` - Character leveled up
- `error` - Error message

## Troubleshooting

### Redis Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:** Start Redis server
```bash
redis-server
# or
brew services start redis
```

### Database Locked

**Error:** `SqliteError: database is locked`

**Solution:** Close other connections or restart dev server

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:** Kill process or change port
```bash
lsof -ti:5173 | xargs kill
# or
pnpm dev --port 3000
```

### Build Errors

Clear build cache:
```bash
rm -rf .svelte-kit node_modules/.vite
pnpm install
pnpm dev
```

## Next Steps

1. **Explore the codebase**: Check `specs/001-fantasy-rpg-game/` for detailed documentation
2. **Read tasks.md**: See all implemented features (158/165 tasks complete!)
3. **Customize**: Modify design tokens in `src/app.css`
4. **Add features**: Follow the task structure in `specs/`

## Support

- **Issues**: https://github.com/your-org/grindolia/issues
- **Docs**: See `specs/` directory
- **Design System**: Visit `/design-system` page

---

Built with ❤️ using SvelteKit, SQLite, Redis, and dark fantasy aesthetics.
