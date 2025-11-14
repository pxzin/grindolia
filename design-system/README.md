# Grindolia Design System

**Theme**: Arcana Dark Fantasy
**Framework**: SvelteKit + UnoCSS + Radix Colors
**Status**: Active Development

---

## 🎨 Color Palette - Arcana Theme

### Background Colors
Deep navy/purple foundations for dark fantasy aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-arcana-bg-primary` | `#1a1d2e` | Main background, darkest layer |
| `--color-arcana-bg-secondary` | `#252842` | Card backgrounds, elevated content |
| `--color-arcana-bg-elevated` | `#2d3250` | Hover states, modal overlays |
| `--color-arcana-bg-overlay` | `rgba(26, 29, 46, 0.95)` | Semi-transparent overlays |

**UnoCSS Classes**: `bg-arcana-bg-primary`, `bg-arcana-bg-secondary`, `bg-arcana-bg-elevated`, `bg-arcana-bg-overlay`

### Gold/Amber (Primary Accent)
Primary accent for buttons, highlights, currency, and important elements.

| Scale | Value | Usage |
|-------|-------|-------|
| 50 | `#fef8e7` | Lightest gold |
| 100 | `#fcefc7` | |
| 200 | `#f9e29c` | |
| 300 | `#f0c78a` | ⭐ Headings, titles |
| 400 | `#e6b973` | |
| 500 | `#d4a574` | |
| 600 | `#c9984a` | ⭐ Primary buttons, borders |
| 700 | `#a67c3a` | |
| 800 | `#86632e` | ⭐ Button borders, dark accents |
| 900 | `#6b4f24` | Darkest gold |

**UnoCSS Classes**: `bg-arcana-gold-{50-900}`, `text-arcana-gold-{50-900}`, `border-arcana-gold-{50-900}`

### Cyan/Blue (Magic & Abilities)
For magical effects, mana bars, abilities, intelligence-based classes.

| Scale | Value | Usage |
|-------|-------|-------|
| 300 | `#5dade2` | ⭐ Mana bars, magical effects |
| 400 | `#4ecdc4` | |
| 500 | `#3ab7b7` | |
| 600 | `#2a9d8f` | ⭐ Magic highlights |
| 700 | `#1e7e72` | Darker magic tones |

**UnoCSS Classes**: `bg-arcana-cyan-{50-900}`, `text-arcana-cyan-{50-900}`

### Magenta/Pink (Special Effects)
For special abilities, enchantments, critical hits, rare items.

| Scale | Value | Usage |
|-------|-------|-------|
| 400 | `#ec407a` | |
| 500 | `#e91e63` | |
| 600 | `#d946ef` | ⭐ Special effects, rare items |
| 700 | `#c2185b` | Darker special tones |

**UnoCSS Classes**: `bg-arcana-magenta-{50-900}`, `text-arcana-magenta-{50-900}`

### Orange/Red (Danger & Health)
For health bars, warnings, danger states, fire effects.

| Scale | Value | Usage |
|-------|-------|-------|
| 400 | `#ffa726` | |
| 500 | `#ff9800` | |
| 600 | `#ff6b35` | ⭐ HP bars, danger states |
| 700 | `#e65100` | |
| 800 | `#bf360c` | ⭐ Critical health, errors |

**UnoCSS Classes**: `bg-arcana-orange-{50-900}`, `text-arcana-orange-{50-900}`

### Green (Success & Healing)
For success states, healing effects, positive status, XP gains.

| Scale | Value | Usage |
|-------|-------|-------|
| 400 | `#66bb6a` | |
| 500 | `#4caf50` | ⭐ Success, healing |
| 600 | `#43a047` | ⭐ XP bars, positive effects |
| 700 | `#388e3c` | Darker success tones |

**UnoCSS Classes**: `bg-arcana-green-{50-900}`, `text-arcana-green-{50-900}`

### Text Colors
Cream/parchment aesthetic for readability on dark backgrounds.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-arcana-text-primary` | `#e8dcc4` | Main text, high readability |
| `--color-arcana-text-secondary` | `#b8a994` | Secondary text, labels |
| `--color-arcana-text-muted` | `#8a7d6f` | Disabled, less important |
| `--color-arcana-text-white` | `#ffffff` | High contrast when needed |
| `--color-arcana-text-gold` | `#f0c78a` | Special text, highlights |

**UnoCSS Classes**: `text-arcana-text-primary`, `text-arcana-text-secondary`, `text-arcana-text-muted`, `text-arcana-text-gold`

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-arcana-border-default` | `#3d4266` | Standard borders |
| `--color-arcana-border-gold` | `#c9984a` | Important borders, selected |
| `--color-arcana-border-glow` | `#5d6ab8` | Magical borders, elevated |

**UnoCSS Classes**: `border-arcana-border-default`, `border-arcana-border-gold`, `border-arcana-border-glow`

---

## 📝 Typography

### Font Families

| Font | Usage | Weights |
|------|-------|---------|
| **Cinzel** (Serif) | Headings, titles, character names, item names | 400, 500, 600, 700, 800 |
| **Inter** (Sans) | Body text, UI labels, descriptions | 300, 400, 500, 600, 700 |
| **Fira Code** (Mono) | Technical info, stats, numbers | 400, 500 |

**UnoCSS Classes**: `font-serif`, `font-sans`, `font-mono`

### Typography Scale

| Size | Value | Usage |
|------|-------|-------|
| XS | `12px` (0.75rem) | Fine print |
| SM | `14px` (0.875rem) | Labels, secondary text |
| Base | `16px` (1rem) | Body text |
| LG | `18px` (1.125rem) | Emphasized text |
| XL | `20px` (1.25rem) | Small headings |
| 2XL | `24px` (1.5rem) | Medium headings |
| 3XL | `30px` (1.875rem) | Large headings |
| 4XL | `36px` (2.25rem) | Extra large headings |
| 5XL | `48px` (3rem) | Hero headings |

**UnoCSS Classes**: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`

### Heading Styles

All headings use:
- Font: Cinzel (serif)
- Weight: Bold (700)
- Color: Gold (#f0c78a)
- Line height: 1.25 (tight)

**UnoCSS Shortcuts**:
- `arcana-heading` - Base heading style
- `arcana-heading-sm` - XL-2XL responsive
- `arcana-heading-md` - 2XL-3XL responsive
- `arcana-heading-lg` - 4XL-5XL responsive

---

## 🎨 Visual Effects

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| Small | `0 1px 2px 0 rgba(0, 0, 0, 0.25)` | Subtle depth |
| Medium | `0 4px 6px -1px rgba(0, 0, 0, 0.3)` | Cards, buttons |
| Large | `0 10px 15px -3px rgba(0, 0, 0, 0.4)` | Elevated cards |
| XL | `0 20px 25px -5px rgba(0, 0, 0, 0.5)` | Modals |
| 2XL | `0 25px 50px -12px rgba(0, 0, 0, 0.6)` | Highest elevation |

**UnoCSS Classes**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`

### Glow Effects

Applied via `box-shadow` for mystical feel.

| Color | Value | Usage |
|-------|-------|-------|
| Gold | `0 0 20px rgba(201, 152, 74, 0.4)` | Gold buttons, treasure |
| Cyan | `0 0 20px rgba(42, 157, 143, 0.4)` | Magical elements, mana |
| Magenta | `0 0 20px rgba(217, 70, 239, 0.4)` | Special abilities, rare |
| Green | `0 0 20px rgba(76, 175, 80, 0.4)` | Healing, success |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| SM | `6px` | Inputs, small elements |
| MD | `8px` | Standard buttons |
| LG | `12px` | Small cards |
| XL | `16px` | Buttons |
| 2XL | `24px` | Large cards, modals |
| Full | `9999px` | Pills, circular |

**UnoCSS Classes**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`

### Backdrop Effects

- **Blur**: `backdrop-filter: blur(8px)` on elevated cards and modals
- Combine with semi-transparent backgrounds for depth

**UnoCSS Classes**: `backdrop-blur-sm`, `backdrop-blur-md`

---

## 🧩 Components

### Button

**Component**: `src/lib/components/ui/Button.svelte`

#### Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | Gold 600 | Dark | Gold 800 | Main actions |
| Secondary | Elevated | Cream | Default | Secondary actions |
| Danger | Orange 600 | White | Orange 800 | Destructive actions |
| Ghost | Transparent | Cream | Transparent | Subtle actions |

#### Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| SM | `16px 8px` | 14px |
| MD | `24px 12px` | 16px |
| LG | `32px 16px` | 18px |

#### Usage

```svelte
<Button variant="primary" size="md">Click Me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### Card

**Component**: `src/lib/components/ui/Card.svelte`

#### Variants

| Variant | Background | Border | Shadow | Usage |
|---------|------------|--------|--------|-------|
| Default | Secondary | Default | XL | Standard cards |
| Elevated | Elevated | Glow | 2XL | Important content |
| Outlined | Transparent | Default 2px | None | Subtle containers |
| Gold | Secondary | Gold 2px | XL | Special/rare items |

#### Padding

| Size | Value |
|------|-------|
| None | `0` |
| SM | `16px` |
| MD | `24px` |
| LG | `32px` |

#### Usage

```svelte
<Card variant="default" padding="md">
  <!-- Content -->
</Card>
<Card variant="elevated">Important!</Card>
<Card variant="gold">Legendary Item</Card>
```

### Input

**Component**: `src/lib/components/ui/Input.svelte`

#### States

| State | Border | Focus Ring |
|-------|--------|------------|
| Normal | Default | Gold 600 |
| Error | Orange 600 | Orange 600 |
| Disabled | Default | None (opacity 50%) |

#### Usage

```svelte
<Input
  label="Character Name"
  placeholder="Enter name..."
  required
/>
<Input
  type="password"
  label="Password"
  error="Password too short"
/>
```

---

## 🎨 UnoCSS Shortcuts

### Arcana Shortcuts

Predefined utility combinations for common patterns.

#### Buttons
- `arcana-btn` - Base button (padding, border-radius, transition)
- `arcana-btn-primary` - Gold primary button
- `arcana-btn-secondary` - Elevated secondary button
- `arcana-btn-hero` - Large hero button (min-width 320px, serif font)

#### Cards
- `arcana-card` - Base card (bg, border, shadow, blur)
- `arcana-card-elevated` - Elevated card with glow
- `arcana-card-gold` - Gold accent card
- `arcana-card-sm` - Small padding (16px)
- `arcana-card-lg` - Large padding (32px)

#### Text
- `arcana-heading` - Gold serif heading
- `arcana-heading-sm` - Small heading (XL-2XL)
- `arcana-heading-md` - Medium heading (2XL-3XL)
- `arcana-heading-lg` - Large heading (4XL-5XL)
- `arcana-text` - Primary cream text
- `arcana-text-muted` - Muted text
- `arcana-text-gold` - Gold accent text

#### Layout
- `center` - Flex center (items + justify)
- `center-col` - Flex center column

#### Usage

```html
<div class="arcana-card">
  <h2 class="arcana-heading-md">Dungeon Name</h2>
  <p class="arcana-text-muted">Floor 3 of 5</p>
  <button class="arcana-btn-primary">Enter</button>
</div>
```

---

## 📱 Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | 2-column layouts |
| Desktop | > 1024px | 3-column layouts |
| Wide | > 1280px | Max width constraint |

**UnoCSS Classes**: `sm:`, `md:`, `lg:`, `xl:`

### Grid System

- **Desktop**: 12-column grid, max width 1280px
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid, full width
- **Gap**: 24px (desktop), 16px (mobile)

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| XS | `4px` | Tight spacing |
| SM | `8px` | Small gaps |
| MD | `16px` | Base spacing |
| LG | `24px` | Section gaps |
| XL | `32px` | Large gaps |
| 2XL | `48px` | Page sections |
| 3XL | `64px` | Hero sections |
| 4XL | `96px` | Major divisions |

**UnoCSS Classes**: `gap-{size}`, `p-{size}`, `m-{size}`, etc.

---

## ✨ Animation Guidelines

### Transitions

| Speed | Duration | Easing | Usage |
|-------|----------|--------|-------|
| Fast | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover states |
| Base | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| Slow | 500ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Modals, major changes |

**UnoCSS Classes**: `transition-all`, `duration-150`, `duration-300`, `duration-500`

### Hover Effects

- **Buttons**: Scale 1.02, add glow
- **Cards**: Lift (translateY -2px), enhance shadow
- **Icons**: Slight rotation or pulse

### Loading States

- **Spinner**: Gold color, smooth rotation
- **Skeleton**: Shimmer effect with gold tint
- **Progress bars**: Smooth width transition

---

## 🎯 Usage Examples

### Character Sheet Card

```svelte
<div class="arcana-card">
  <div class="flex items-center gap-4 mb-6">
    <img src={portrait} class="w-16 h-16 rounded-lg border-2 border-arcana-gold-600" />
    <div>
      <h3 class="arcana-heading-sm">{characterName}</h3>
      <p class="arcana-text-muted">{className} - Level {level}</p>
    </div>
  </div>

  <!-- HP Bar -->
  <div class="mb-4">
    <div class="flex justify-between arcana-text-muted text-sm mb-1">
      <span>HP</span>
      <span>{hp} / {maxHp}</span>
    </div>
    <div class="w-full bg-arcana-bg-primary rounded-full h-2">
      <div class="bg-arcana-orange-600 h-2 rounded-full" style="width: {hpPercent}%"></div>
    </div>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-arcana-bg-primary rounded-lg p-3">
      <span class="arcana-text-muted text-sm">Strength</span>
      <span class="arcana-text text-lg font-bold">{strength}</span>
    </div>
    <!-- More stats... -->
  </div>
</div>
```

### Primary Action Button

```svelte
<button class="arcana-btn-primary">
  Begin Adventure
</button>
```

### Dungeon Selection Card

```svelte
<div class="arcana-card hover:arcana-card-elevated transition-all cursor-pointer">
  <h3 class="arcana-heading-md mb-2">Dark Caverns</h3>
  <p class="arcana-text mb-4">A mysterious dungeon filled with ancient secrets...</p>
  <div class="flex justify-between items-center">
    <span class="arcana-text-muted text-sm">Min Level: 5 • 10 Floors</span>
    <button class="arcana-btn-secondary">Enter</button>
  </div>
</div>
```

---

## 📚 Resources

- **Figma Design**: See `design-system/figma-prompt-complete.md` for complete design specifications
- **Color Palette**: Defined in `src/app.css`
- **UnoCSS Config**: `uno.config.ts`
- **Components**: `src/lib/components/ui/`

---

## 🔄 Theme Switching (Future)

The design system is built with CSS variables, making theme switching possible:

```css
:root[data-theme="light"] {
  --color-arcana-bg-primary: #f5f5f5;
  --color-arcana-text-primary: #1a1d2e;
  /* ... other overrides */
}
```

Currently only dark theme (Arcana) is implemented.

---

**Last Updated**: 2025-01-14
**Version**: 1.0.0 (MVP)
