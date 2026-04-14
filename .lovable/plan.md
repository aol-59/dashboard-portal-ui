

# Dashboard Portal Frontend — Implementation Plan

## Theme (from hajj-vista.lovable.app)
- **Light, clean, professional** with white/off-white backgrounds (`#F8F9FA` / `#FFFFFF`)
- **Green primary accent** (`#10B981` emerald) for highlights, progress bars, active states
- Cards with subtle borders and soft shadows, rounded corners
- Clean header bar with user info, dark mode toggle, notifications
- Tab-style navigation for sections
- Filter bars with dropdowns
- KPI cards with large numbers, progress bars, and targets
- Dark mode support with deep slate backgrounds

## Pages & Features

### 1. Welcome Page (`/`)
- Public, no auth — full-screen centered layout with gradient background
- App logo, heading "Dashboard Portal", tagline, prominent Login button
- Auto-redirect to `/portal` if already authenticated

### 2. Auth Layer (Keycloak)
- `src/lib/auth.ts` — keycloak-js initialization with env vars
- `check-sso` mode (no forced login), export `login()`, `logout()`, `isAuthenticated()`, token getter
- Mock mode when `VITE_USE_MOCKS=true` for Lovable preview
- `<ProtectedRoute>` wrapper component for all non-welcome routes

### 3. App Shell Layout (all authenticated pages)
- Collapsible sidebar (left in LTR, right in RTL) with dynamic entity links from API
- Header: app name, language toggle (EN/عربي), dark/light toggle, user avatar dropdown
- Mobile: sidebar becomes slide-out drawer via Sheet component

### 4. Portal Home (`/portal`)
- Welcome greeting with user's display name
- Grid of entity cards from `/api/v1/portal/summary`
- Each card: entity name, description, Lucide icon, colored accent bar — clickable to `/dashboard/:slug`
- Empty state with "Request Access" CTA

### 5. Request Access (`/portal/request-access`)
- List available entities with checkboxes, optional reason field
- Submit via `POST /api/v1/access-requests`, success toast

### 6. Access Requests (`/portal/access-requests`)
- Table with filter tabs (All/Pending/Approved/Rejected)
- Approve/Reject actions for pending requests with status badges

### 7. Entity Dashboard (`/dashboard/:slug`)
- Dynamic page with entity header + colored accent
- Placeholder KPI cards (4), chart area, recent items table
- Ready for future entity-specific API endpoints

### 8. Admin: User Management (`/admin/users`)
- Users table with Add/Edit/Toggle Admin/Deactivate actions
- Dialog modals for forms, expandable entity access per user

### 9. Admin: Entity Access (`/admin/access`)
- Entity selector dropdown, Owners/Viewers sections
- Add/Remove access with searchable user dropdown

## Cross-Cutting

### Internationalization (EN/AR)
- `src/lib/language.tsx` — React Context with `useLanguage()` hook, `t()` function
- RTL support: `dir="rtl"` on HTML, sidebar flips, all text via translation keys
- Entity names use `name` (EN) or `name_ar` (AR) from API

### Dark Mode
- Class-based toggle with Tailwind `dark:` variants, persisted in localStorage

### API Client (`src/lib/api.ts`)
- Typed fetch functions with Bearer token, 401 → login redirect
- React Query hooks in `src/hooks/` for each API area with mutations + cache invalidation

### UX Details
- Loading skeletons, error states with retry, success/error toasts
- Hover effects on cards, sortable tables, proper focus states
- Responsive: desktop, tablet, mobile

