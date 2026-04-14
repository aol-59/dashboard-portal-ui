

# Portal Page — Premium Executive Redesign v2

## What's Wrong Now
The current design is too flat and generic — faint gradients on white, small stat cards crammed inside the hero, plain entity cards with thin accent bars. It doesn't feel "executive" or "fancy."

## New Design Direction
A bold, dark-glass executive command center inspired by premium fintech dashboards. Key shifts:

- **Dark hero banner** with a rich emerald-to-dark gradient, large typography, and an animated shimmer effect
- **Floating stat cards** pulled out of the hero into their own row with large numbers, glow borders, and animated count-up feel
- **Entity cards with depth** — taller cards, prominent rounded icon with colored glow ring, shimmer hover overlay, smooth scale+shadow on hover
- **Animated grid lines** — subtle CSS grid-pattern background behind the entity section for a "command center" feel
- **Better spacing & typography** — more whitespace, larger heading, refined hierarchy

## Specific Changes

### 1. Hero Section
- Full-width dark gradient banner (`bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#047857]`) with a subtle dot-grid overlay pattern
- Large greeting text (text-4xl bold), user name prominent, subtitle underneath
- Animated shimmer line sweeping across (CSS `@keyframes shimmer` via pseudo-element)

### 2. Stats Row (separate from hero)
- 3 cards in their own section below hero, each with:
  - Glass background (`bg-card/60 backdrop-blur-xl border border-primary/20`)
  - Large number (text-4xl), colored icon, subtle glow shadow
  - Bottom colored accent line (2px)

### 3. Search & Filter Bar
- Taller search input (h-12) with frosted glass, rounded-2xl
- Filter pills with colored dot indicators for count, more prominent active state with glow

### 4. Entity Cards
- Taller layout with more padding (p-6)
- Large icon container (h-14 w-14) with colored ring glow (`box-shadow: 0 0 20px ${color}40`)
- On hover: scale(1.03), large shadow with entity color tint, shimmer overlay sweep
- Status badge repositioned to bottom with more prominence
- Removed thin accent bar, replaced with top gradient border (3px)

### 5. Background
- Subtle CSS radial dot-grid pattern behind the entity grid area
- Keep the existing blur orbs but make them slightly more visible

### 6. Animations
- Add CSS `@keyframes shimmer` to `index.css` for the hero and card hover effects
- Staggered entrance stays but with spring-like easing

## Files Modified
- **`src/pages/PortalPage.tsx`** — Complete JSX/styling overhaul
- **`src/index.css`** — Add shimmer keyframe and dot-grid pattern utility class

