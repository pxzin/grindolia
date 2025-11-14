# Figma AI Design Prompt - Grindolia (Complete Vision)

## Project Overview
**Grindolia** is a web-based dark fantasy RPG dungeon crawler with multiplayer features, built using SvelteKit. This prompt covers the complete vision including MVP features and future planned systems.

---

## 🎨 Design Theme: "Arcana Dark Fantasy"

### Core Aesthetic
Mystical, atmospheric dungeon crawler inspired by classic RPGs with a modern web interface. The design should feel immersive, mysterious, and rewarding - combining medieval fantasy elements with magical mysticism.

---

## 🎨 Color Palette

### Primary Backgrounds (Deep Navy/Purple)
- **Primary**: `#1a1d2e` - Main background, darkest layer
- **Secondary**: `#252842` - Card backgrounds, elevated content
- **Elevated**: `#2d3250` - Hover states, modal overlays
- **Overlay**: `rgba(26, 29, 46, 0.95)` - Semi-transparent overlays

Use subtle radial gradients with purple (#5d6ab8 at 5% opacity) and gold (#c9984a at 3% opacity) hints for depth.

### Accent Colors

#### Gold/Amber (Primary Actions & Currency)
Primary accent color for buttons, highlights, important elements, and gold/currency displays.
- **50**: `#fef8e7`
- **100**: `#fcefc7`
- **200**: `#f9e29c`
- **300**: `#f0c78a` ⭐ (Headings)
- **400**: `#e6b973`
- **500**: `#d4a574`
- **600**: `#c9984a` ⭐ (Primary buttons, borders)
- **700**: `#a67c3a`
- **800**: `#86632e` ⭐ (Button borders)
- **900**: `#6b4f24`

#### Cyan/Blue (Magic, Mana, Abilities)
For magical effects, mana bars, abilities, intelligence-based classes.
- **300**: `#5dade2` ⭐ (Mana bars)
- **400**: `#4ecdc4`
- **500**: `#3ab7b7`
- **600**: `#2a9d8f` ⭐ (Magic highlights)
- **700**: `#1e7e72`

#### Magenta/Pink (Special Abilities, Critical Hits)
For special abilities, enchantments, critical damage indicators, rare items.
- **400**: `#ec407a`
- **500**: `#e91e63`
- **600**: `#d946ef` ⭐ (Special effects)
- **700**: `#c2185b`

#### Orange/Red (Danger, HP, Fire)
For health bars, warnings, danger states, fire effects, combat damage.
- **400**: `#ffa726`
- **500**: `#ff9800`
- **600**: `#ff6b35` ⭐ (HP bars, danger)
- **700**: `#e65100`
- **800**: `#bf360c` ⭐ (Critical health)

#### Green (Success, Healing, Nature)
For success states, healing effects, positive status, experience gains.
- **400**: `#66bb6a`
- **500**: `#4caf50` ⭐ (Success, healing)
- **600**: `#43a047` ⭐ (XP bars)
- **700**: `#388e3c`

### Text Colors (Cream/Parchment Aesthetic)
- **Primary**: `#e8dcc4` - Main text, readable cream color
- **Secondary**: `#b8a994` - Secondary text, labels
- **Muted**: `#8a7d6f` - Disabled states, less important text
- **White**: `#ffffff` - High contrast text when needed
- **Gold**: `#f0c78a` - Special text, names, titles

### Border Colors
- **Default**: `#3d4266` - Standard borders on cards/inputs
- **Gold**: `#c9984a` - Important borders, selected states
- **Glow**: `#5d6ab8` - Magical borders, elevated cards

---

## ✨ Visual Effects

### Shadows
- **Small**: `0 1px 2px 0 rgba(0, 0, 0, 0.25)`
- **Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.3)`
- **Large**: `0 10px 15px -3px rgba(0, 0, 0, 0.4)`
- **XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.5)`
- **2XL**: `0 25px 50px -12px rgba(0, 0, 0, 0.6)`

### Glow Effects (box-shadow)
- **Gold Glow**: `0 0 20px rgba(201, 152, 74, 0.4)` - On gold buttons, treasure, currency
- **Cyan Glow**: `0 0 20px rgba(42, 157, 143, 0.4)` - On magical elements, mana
- **Magenta Glow**: `0 0 20px rgba(217, 70, 239, 0.4)` - On special abilities, rare items
- **Green Glow**: `0 0 20px rgba(76, 175, 80, 0.4)` - On healing, success states

Apply glows on hover states and active elements for mystical feel.

### Border Radius
- **Small**: `6px` - Inputs, small buttons
- **Medium**: `8px` - Standard buttons
- **Large**: `12px` - Small cards
- **XL**: `16px` - Buttons
- **2XL**: `24px` - Large cards, modals

### Backdrop Effects
- Use `backdrop-filter: blur(8px)` on elevated cards and modals
- Combine with semi-transparent backgrounds for depth

---

## 📝 Typography

### Fonts
- **Serif (Cinzel)**: Headings, important titles, class names, item names
  - Weights: 400, 500, 600, 700, 800
  - Use for: h1-h6, card titles, character names, item names

- **Sans (Inter)**: Body text, UI labels, descriptions
  - Weights: 300, 400, 500, 600, 700
  - Use for: paragraphs, buttons, labels, stats

- **Mono (Fira Code)**: Technical info, stats, numbers
  - Weights: 400, 500
  - Use for: damage numbers, stat values, code-like elements

### Scale
- **XS**: 12px (0.75rem) - Fine print
- **SM**: 14px (0.875rem) - Labels, secondary text
- **Base**: 16px (1rem) - Body text
- **LG**: 18px (1.125rem) - Emphasized text
- **XL**: 20px (1.25rem) - Small headings
- **2XL**: 24px (1.5rem) - Medium headings
- **3XL**: 30px (1.875rem) - Large headings
- **4XL**: 36px (2.25rem) - Extra large headings
- **5XL**: 48px (3rem) - Hero headings

### Heading Styling
- All headings: Cinzel font, bold (700), gold color (#f0c78a)
- Line height: 1.25 (tight)
- Use gold glow effect on important headings

### Body Styling
- Inter font, regular (400), cream color (#e8dcc4)
- Line height: 1.5 (normal)

---

## 🧩 Component Design Specifications

### 1. Buttons

#### Primary Button (Gold)
- Background: `#c9984a` (gold-600)
- Text: `#1a1d2e` (dark text for contrast)
- Border: `2px solid #86632e` (gold-800)
- Padding: `12px 24px`
- Border radius: `16px`
- Font: Inter, bold (700)
- Transition: `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`
- Hover: Background `#d4a574` (gold-500), add gold glow
- Active: Slightly darker, pressed effect

#### Secondary Button
- Background: `#2d3250` (elevated)
- Text: `#e8dcc4` (cream)
- Border: `2px solid #3d4266` (default border)
- Same padding and radius as primary
- Hover: Background `#252842`, border glow `#5d6ab8`

#### Hero Button (Large call-to-action)
- Same as primary but larger
- Min width: `320px`
- Font size: `20px` (xl)
- Font: Cinzel (serif)
- Border: `3px solid #86632e`
- Extra padding: `16px 32px`

#### Button States
- Disabled: Opacity 0.5, no hover effects
- Loading: Show spinner, maintain size
- Icon buttons: Square, same height as text buttons

### 2. Cards

#### Standard Card
- Background: `#252842` (secondary)
- Border: `1px solid #3d4266` (default border)
- Border radius: `24px`
- Padding: `24px`
- Shadow: Large shadow (see above)
- Backdrop blur: `8px`

#### Elevated Card (Important content)
- Background: `#2d3250` (elevated)
- Border: `1px solid #5d6ab8` (glow border)
- Shadow: 2XL shadow
- Add subtle glow effect

#### Gold Accent Card (Rare/Special items)
- Same as standard card
- Border: `2px solid #c9984a` (gold-600)
- Add gold glow effect
- Subtle gold gradient overlay (optional)

#### Card Sizes
- **Small**: Padding `16px`
- **Medium**: Padding `24px` (default)
- **Large**: Padding `32px`

### 3. Progress Bars

#### Health Bar (HP)
- Background: `rgba(0, 0, 0, 0.3)`
- Fill: Linear gradient `#ff6b35` to `#ff9800` (orange-red)
- Height: `8px` (thin) or `16px` (thick for character sheet)
- Border radius: `9999px` (full rounded)
- Inner shadow for depth
- Smooth transition on value change

#### Mana Bar
- Fill: Linear gradient `#2a9d8f` to `#5dade2` (cyan-blue)
- Same styling as HP bar

#### Experience Bar (XP)
- Fill: Linear gradient `#43a047` to `#66bb6a` (green)
- Same styling as HP bar
- Optional: Pulse effect when near level up

#### Progress Bar Labels
- Above bar: Show current/max values
- Font: Inter, medium weight
- Color: Secondary text (#b8a994)

### 4. Input Fields

#### Text Input
- Background: `#2d3250` (elevated)
- Border: `1px solid #3d4266` (default)
- Padding: `12px 16px`
- Border radius: `8px`
- Text color: `#e8dcc4` (cream)
- Placeholder: `#8a7d6f` (muted)
- Font: Inter, regular

#### Focus State
- Border: `2px solid #c9984a` (gold)
- Outline: None
- Box shadow: `0 0 0 3px rgba(201, 152, 74, 0.2)` (gold ring)

#### Error State
- Border: `2px solid #ff6b35` (orange-red)
- Helper text below in red

#### Disabled State
- Opacity: 0.5
- Cursor: not-allowed

### 5. Modals & Overlays

#### Modal Container
- Background: `rgba(26, 29, 46, 0.95)` (overlay)
- Backdrop blur: `12px`
- Centered on screen

#### Modal Content
- Use Elevated Card styling
- Max width: `600px` (medium) or `800px` (large)
- Padding: `32px`
- Close button: Top right, icon only, secondary style

#### Modal Header
- Cinzel font, gold color
- Font size: 2XL (24px)
- Margin bottom: `24px`
- Optional: Divider line below

### 6. Stats Display

#### Stat Item (e.g., Strength: 15)
- Layout: Flex, space-between
- Label: Inter, secondary color, small size
- Value: Inter, primary color, semibold, larger size
- Background: `rgba(0, 0, 0, 0.1)` (subtle)
- Padding: `8px 12px`
- Border radius: `6px`

#### Stat Grid
- 2-column layout on desktop
- 1-column on mobile
- Gap: `12px`

### 7. Character Portrait

#### Portrait Container
- Square aspect ratio (1:1)
- Border: `2px solid #c9984a` (gold)
- Border radius: `12px`
- Box shadow: Gold glow
- Background: Gradient if no image

#### Portrait Image
- Object fit: Cover
- Filter: Slight sepia tone for fantasy feel (optional)

#### Class Badge/Icon
- Position: Absolute, top right corner
- Small circle with class icon
- Background: Class-specific color
  - Warrior: Red (#ff6b35)
  - Mage: Cyan (#2a9d8f)
  - Rogue: Green (#43a047)
  - Cleric: Magenta (#d946ef)

---

## 📱 Layout Specifications

### Grid System
- **Desktop**: 12-column grid, max width 1280px
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid, full width
- Gap: `24px` (desktop), `16px` (mobile)

### Spacing Scale
- **XS**: `4px`
- **SM**: `8px`
- **MD**: `16px` (base)
- **LG**: `24px`
- **XL**: `32px`
- **2XL**: `48px`
- **3XL**: `64px`
- **4XL**: `96px`

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1280px

---

## 🎮 Screen Designs Needed

### 1. Authentication Screens

#### Registration Page
- Centered card (max width 400px)
- Title: "Create Account" (Cinzel, gold)
- Fields:
  - Username input
  - Email input
  - Password input (with show/hide toggle)
  - Confirm password input
- Primary button: "Create Account"
- Link below: "Already have an account? Login"
- Background: Main BG with radial gradients

#### Login Page
- Similar layout to registration
- Fields:
  - Username/Email input
  - Password input
- Primary button: "Login"
- Link: "Don't have an account? Register"
- Optional: "Forgot password?" link

### 2. Character Creation

#### Layout
- Full screen, centered content
- Max width: `800px`

#### Header
- Title: "Create Your Hero" (Cinzel, 3XL, gold)
- Subtitle: "Choose your path" (Inter, secondary)

#### Class Selection
- Grid: 2x2 (desktop) or 1 column (mobile)
- Each class card:
  - Large icon/illustration placeholder
  - Class name (Cinzel, gold, XL)
  - 2-3 line description
  - Starting stats preview (small stat grid)
  - Hover: Elevated, gold border glow
  - Selected: Gold border, gold glow

#### Classes to Include
- **Warrior**: Red accent, sword icon, high HP/Strength
- **Mage**: Cyan accent, staff icon, high Intelligence
- **Rogue**: Green accent, dagger icon, high Dexterity
- **Cleric**: Magenta accent, holy symbol, high Vitality/Intelligence

#### Character Name Input
- Below class selection
- Label: "Character Name"
- Text input with fantasy placeholder

#### Footer
- Primary hero button: "Begin Adventure"
- Disabled until class selected and name entered

### 3. Town/Hub Screen (Future)

#### Layout
- Full width layout with navigation
- Header with character info (mini sheet)
- Main area: Grid of location cards

#### Location Cards
- Medium cards in 2-3 column grid
- Each location:
  - Icon/illustration
  - Location name (Cinzel, gold)
  - Description (2 lines max)
  - Enter button (secondary)

#### Locations to Include
- **Dungeon Gate**: Enter dungeons
- **Marketplace**: Buy/sell items
- **Blacksmith**: Upgrade equipment
- **Tavern**: Accept quests, rest
- **Arena**: PvP battles
- **Guild Hall**: Join guilds, multiplayer

#### Top Bar
- Left: Character portrait (small) + name + level
- Center: Gold currency display
- Right: Settings icon, logout

### 4. Dungeon Exploration Screen (MVP)

#### Layout
- 3-column layout (desktop):
  - **Left Sidebar** (1/3 width): Character sheet
  - **Main Area** (2/3 width): Dungeon view
- Stacked on mobile

#### Left Sidebar - Character Sheet Card
- **Header**:
  - Character portrait (medium size)
  - Character name (Cinzel, gold, LG)
  - Class and level (Inter, secondary, SM)

- **HP Bar**:
  - Label: "HP"
  - Current/Max values (e.g., "45 / 60")
  - Orange-red gradient bar

- **XP Bar**:
  - Label: "XP"
  - Current/Next level values (e.g., "1,234 / 2,000")
  - Green gradient bar

- **Stats Grid** (2 columns):
  - Strength
  - Intelligence
  - Dexterity
  - Vitality

- **Currency Section** (bottom):
  - Divider line above
  - Gold icon + amount
  - Gold color (#f0c78a)

#### Main Area - Dungeon View

**Header**:
- Dungeon name (Cinzel, 2XL, gold)
- Floor indicator (e.g., "Floor 3 / 5")
- Difficulty badge (colored based on level)

**Status Area** (Card):
- Current floor description
- Monster count
- Recommended level
- Special conditions (if any)

**Action Buttons** (Grid):
- Primary button: "Fight Monster" (gold)
- Secondary button: "Explore" (Find loot/secrets)
- Secondary button: "Descend" (Next floor)
  - Disabled if floor not cleared
  - Show requirement: "Defeat 5 monsters"
- Secondary button: "Exit Dungeon"

**Message Log** (Card):
- Scrollable area
- Recent actions/events
- Color-coded messages:
  - Damage: Red
  - Healing: Green
  - Loot: Gold
  - XP gain: Cyan

### 5. Combat Arena (MVP)

#### Layout
- Full width, centered content
- Two-panel design

#### Left Panel - Player Info
- Character portrait
- Name and level
- HP bar (large, animated)
- Current stats displayed
- Status effects (if any)

#### Right Panel - Enemy Info
- Monster illustration placeholder
- Monster name (Cinzel, gold)
- Level and type
- HP bar (large, animated)
- Visible stats (scaled for floor)

#### Center - Combat Log
- Between panels or below
- Scrollable message area
- Action-by-action breakdown:
  - "You attack for 15 damage!"
  - "Goblin attacks for 8 damage!"
  - "You gained 50 XP!"

#### Bottom - Action Buttons
- Primary button: "Attack" (large, gold)
- Secondary button: "Flee" (smaller)
- Keyboard shortcut hints (optional)

#### Victory/Defeat Overlay
- Modal overlay
- **Victory**:
  - Title: "Victory!" (gold, glowing)
  - XP gained
  - Level up notification (if applicable)
  - Loot drops (item cards)
  - Continue button
- **Defeat**:
  - Title: "Defeated" (red)
  - Message: Death consequences
  - Respawn/return button

### 6. Inventory Screen (Future)

#### Layout
- Two-panel design

#### Left Panel - Equipment Slots
- Character silhouette with equipment slots:
  - Helmet
  - Armor
  - Weapon (main hand)
  - Off-hand (shield/secondary weapon)
  - Accessory 1
  - Accessory 2
- Drag-and-drop enabled
- Empty slots: Dashed border, icon placeholder

#### Right Panel - Inventory Grid
- Grid layout: 8 columns
- Item cards:
  - Item icon
  - Item name
  - Rarity color border:
    - Common: Gray
    - Uncommon: Green
    - Rare: Blue
    - Epic: Purple
    - Legendary: Gold
  - Hover: Show tooltip with stats

#### Bottom - Inventory Actions
- Sort buttons (Type, Rarity, Name)
- Filter dropdown
- Capacity indicator: "45 / 100"

#### Item Tooltip (Hover)
- Item name with rarity color
- Item type (Weapon, Armor, Consumable)
- Stats preview
- Flavor text
- Equip/Use/Drop buttons

### 7. Quest System (Future)

#### Quest List Page

**Layout**:
- Left sidebar: Active quests
- Main area: Selected quest details

**Quest List Item** (Card, small):
- Quest name (Cinzel, gold)
- Quest giver
- Progress bar or objectives count
- Difficulty indicator (color-coded)
- Click to view details

**Quest Details Panel**:
- Large card
- Quest name (Cinzel, 2XL, gold)
- Quest giver and location
- Full description (narrative text)
- Objectives list (checkboxes):
  - "✓ Completed objective" (green)
  - "◻ Pending objective" (muted)
- Rewards section:
  - XP amount
  - Gold amount
  - Item rewards (item cards)
- Action button: "Complete Quest" or "Abandon Quest"

#### Quest Types
- **Main Quest**: Gold accent, story icon
- **Side Quest**: Cyan accent, scroll icon
- **Daily Quest**: Orange accent, sun icon
- **Repeatable Quest**: Green accent, cycle icon

### 8. Multiplayer/Social Features (Future)

#### Guild Hall
- Guild banner/emblem (large)
- Guild name (Cinzel, gold, 3XL)
- Member list (scrollable cards)
- Guild stats (level, members, achievements)
- Guild chat area
- Actions: Invite, promote, kick (role-based)

#### Party Formation
- Party slots (4-6 members)
- Each slot:
  - Player portrait
  - Name and class
  - Ready status indicator
  - Remove button (leader only)
- Invite button
- Ready/Start button

#### Arena Matchmaking
- Queue status
- Player info cards (you vs opponent)
- Countdown timer
- Match history (scrollable list)

### 9. Marketplace (Future)

#### Layout
- Grid of item listings

#### Item Listing Card
- Item icon/image
- Item name and rarity
- Seller name
- Price (gold)
- Buy button
- Hover: Tooltip with item details

#### Filters Panel (Sidebar)
- Item type dropdown
- Rarity checkboxes
- Price range slider
- Sort by: Price, rarity, recently listed

#### Sell Item Modal
- Item selection
- Set price input
- Listing fee display
- Confirm button

### 10. Auction House (Future)

Similar to marketplace but with bidding:
- Current bid display
- Bid history
- Time remaining (countdown)
- Place bid input
- Auto-bid feature (checkbox)

---

## 🎨 Animation Guidelines

### Transitions
- **Fast**: 150ms - Hover states, small UI changes
- **Base**: 300ms - Most transitions, button clicks
- **Slow**: 500ms - Modals, large state changes
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth)

### Hover Effects
- Buttons: Scale 1.02, add glow
- Cards: Lift (translateY -2px), add shadow
- Icons: Slight rotation or pulse

### Loading States
- Spinner: Gold color, smooth rotation
- Skeleton screens: Shimmer effect with gold tint
- Progress bars: Smooth width transition

### Combat Animations
- Damage numbers: Float up, fade out (red for damage, green for healing)
- HP bar: Smooth decrease/increase with spring animation
- Hit flash: Brief white overlay on character/monster

### Loot Drop
- Items: Drop from top, bounce effect
- Gold coins: Scatter and collect animation
- Rarity: Glow pulse based on rarity color

### Level Up
- Screen flash (gold)
- Particle burst effect
- Stats: Count up animation
- Congratulations banner

---

## 📐 Responsive Design Rules

### Mobile (< 640px)
- Single column layouts
- Stacked cards
- Full-width buttons
- Larger touch targets (min 44px height)
- Simplified navigation (hamburger menu)
- Condensed stat displays

### Tablet (640px - 1024px)
- 2-column layouts where appropriate
- Slightly larger cards
- Sidebar can be toggleable drawer

### Desktop (> 1024px)
- 3-column layouts
- Fixed sidebars
- Hover interactions enabled
- Keyboard shortcuts

---

## 🌟 Special Design Elements

### Background Decorations
- Subtle mystical particles (floating, slow movement)
- Faint rune patterns in background (very low opacity)
- Radial gradient overlays for depth
- Constellation patterns (optional, very subtle)

### Card Decorations
- Corner ornaments (medieval style, optional)
- Divider lines with small ornaments
- Subtle texture overlay (parchment/stone)

### Button Decorations
- Inner glow on hover
- Subtle pattern overlay (gold buttons)
- Icon + text combinations

### Badges & Indicators
- Level badge: Small circle, gold border, number inside
- Notification dot: Red dot, small, positioned top-right
- Status indicators: Colored dots (green=online, red=offline, yellow=busy)
- Rarity badges: Small gem icon with rarity color

### Icons
- Use consistent icon set (e.g., Heroicons, Lucide)
- Icon size: 16px (small), 20px (medium), 24px (large)
- Color: Match text color or use accent colors
- Combine with text labels for clarity

---

## 🎯 Output Requirements

Please create the following Figma screens:

### Phase 1 - MVP Screens (Priority)
1. **Authentication**:
   - Login page
   - Registration page

2. **Character Creation**:
   - Class selection screen
   - Name entry screen

3. **Dungeon Crawler**:
   - Dungeon exploration screen (with character sheet sidebar)
   - Combat arena screen
   - Victory modal
   - Defeat modal

### Phase 2 - Extended Screens (Future)
4. **Town Hub**:
   - Main town screen with location cards

5. **Inventory**:
   - Inventory management screen
   - Equipment panel
   - Item tooltip design

6. **Quest System**:
   - Quest list screen
   - Quest details panel
   - Quest completion modal

7. **Multiplayer**:
   - Guild hall screen
   - Party formation screen
   - Arena matchmaking screen

8. **Economy**:
   - Marketplace screen
   - Auction house screen
   - Item listing cards

### Design Deliverables
- Desktop view (1280px width) for all screens
- Mobile view (375px width) for critical flows
- Component library with all reusable elements
- All UI states: default, hover, active, disabled, loading
- Color palette and typography styles
- Animation notes for developers

### Design System
- Create a design system page with:
  - All color tokens
  - Typography scale
  - Button variants
  - Card variants
  - Input fields
  - Progress bars
  - Icons and badges
  - Spacing scale

---

## 💡 Design Philosophy

### User Experience Goals
- **Immersive**: Dark fantasy atmosphere, cohesive visual language
- **Clear**: High contrast, readable text, obvious interactions
- **Rewarding**: Satisfying animations, celebration of achievements
- **Accessible**: WCAG AA contrast, keyboard navigation, screen reader friendly

### Visual Hierarchy
1. Primary actions: Gold, large, prominent
2. Important info: Gold text, Cinzel font, larger size
3. Content: Cream text, good contrast
4. Secondary info: Muted text, smaller size

### Consistency
- Maintain spacing scale throughout
- Use color palette consistently
- Button styles should be predictable
- Card layouts follow same pattern

### Performance
- Optimize images and illustrations
- Use CSS effects over images when possible
- Limit number of active animations
- Consider data usage for mobile

---

## 🔗 Technical Constraints

### Framework: SvelteKit + UnoCSS
- Design should be implementable with utility-first CSS
- Avoid designs requiring complex CSS that can't be represented with utilities
- Components should be modular and reusable

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support needed
- Use modern CSS features (Grid, Flexbox, Custom Properties)

### Accessibility
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Focus indicators: Visible on all interactive elements
- Semantic HTML: Buttons, headings, landmarks
- Screen reader friendly: Labels, alt text, ARIA where needed

---

## 📝 Notes for Designers

- This is a web application, not native mobile
- Hover states are important (not touch-only)
- Think modular - components should be reusable
- Dark theme only (no light mode needed for MVP)
- Fantasy aesthetic should feel serious, not cartoonish
- Gold accents should feel precious, not overwhelming
- Maintain readability - don't sacrifice clarity for style

---

**End of Prompt**

Use this comprehensive guide to create a cohesive, beautiful, and functional design for Grindolia. The design should feel like a modern web-based RPG while maintaining the dark fantasy aesthetic and ensuring excellent usability.
