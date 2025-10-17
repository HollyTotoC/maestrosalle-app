# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MaestroSalle is a Next.js 15 restaurant management application built with React 19, TypeScript, Firebase, and Tailwind CSS. It manages daily operations including cash closures ("clôtures"), inventory tracking (tiramisu batches), tickets, staff availability scheduling ("dispos"), and team management.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The application runs on http://localhost:3000 by default.

## Architecture

### Firebase Integration

The app uses Firebase for authentication and Firestore for data persistence:

- **Client-side auth**: `src/lib/firebase/client.ts` handles Google authentication with `loginWithGoogle()` and `logout()`
- **Server-side operations**: `src/lib/firebase/server.ts` contains all Firestore CRUD operations and real-time listeners
- **Database instance**: `src/lib/firebase/firebase.ts` exports the initialized `db` instance

All Firestore operations use real-time listeners (`onSnapshot`) for live updates across components.

### State Management

The app uses Zustand with persistence for state management:

- **`useAppStore`** (`src/store/store.ts`): Selected restaurant state (persisted to localStorage)
- **`useUserStore`** (`src/store/useUserStore.ts`): Current user authentication state with role, restaurant assignment, and profile data
- **`useUsersStore`** (`src/store/useUsersStore.ts`): All users data synchronized from Firestore
- **`useClosuresStore`**, **`useTicketStore`**, **`useThemeStore`**: Domain-specific stores

All stores with persistence include a `hasHydrated` pattern to prevent hydration mismatches. Always check `hasHydrated` before rendering persisted state.

### Authentication Flow

1. `AuthProvider` (`src/components/AuthProvider.tsx`) wraps the app in `src/app/layout.tsx`
2. On auth state change, fetches user data from Firestore `users` collection
3. Syncs user data (role, restaurantId, isAdmin, etc.) to `useUserStore`
4. Components access current user via `useUserStore` hooks

User roles: `admin`, `CDI`, `manager`, `cuisine`, `extra`

### Route Structure

- `/` - Home page
- `/dashboard` - Main dashboard with charts and overview
- `/cloture` - 8-step cash closure workflow
- `/tiramisu` - Tiramisu batch inventory management with FIFO consumption
- `/stocks` - Ticket-based stock management system
- `/dispos` - Staff availability scheduling (weekly planning)
- `/team` - Team member management
- `/profil` - User profile
- `/tools/invitations` - Invitation code generation (admin only)
- `/tipsParty` - Tips party management

### Key Data Models

**ClosureData** (`src/types/cloture.ts`): Daily cash reconciliation with TPE amounts, Zelty integration, cash flow tracking, and discrepancy detection (CB/cash status: OK/warning/alert)

**TiramisuBatch** (`src/types/tiramisu.ts`): FIFO inventory tracking with partial consumption tracking (0-1 scale), consumption history, and automatic remaining stock calculation

**Ticket** (`src/types/ticket.ts`): Stock request system with statuses (new/seen/in_progress/resolved), delivery tracking, and auto-hide after 72 hours

**User** (`src/types/user.ts`): Team member profiles with role-based permissions, restaurant assignment, and admin flags

**UserDispos** (`src/types/dispos.ts`): Weekly availability by day/shift (midi/soir) with priority levels and shift preferences

### Cash Closure Workflow

The 8-step closure process (`src/app/cloture/page.tsx`):
1. Date selection with automatic previous cash retrieval
2. TPE terminal amounts entry
3. Zelty CB/cash amounts with cash-out tracking
4. Extra cash flows (custom entries)
5. Physical cash count
6. Automatic discrepancy calculation
7. Cash distribution (to keep/to safe)
8. Final validation and save to Firestore

Each step is a separate component (`src/components/cloture/Step[1-8].tsx`) that updates shared `formData` state.

### Tiramisu Inventory System

FIFO-based batch tracking with percentage-based consumption:
- `addBatch()`: Creates new batch with total bacs count
- `updateTiramisuStock()`: Consumes oldest batches first, handles partial consumption
- Real-time updates via `listenToBatchesFiltered()` showing only batches with remaining stock
- Consumption history tracks who updated when and how much

### Component Patterns

**UI Components**: Radix UI primitives in `src/components/ui/` (button, dialog, dropdown, etc.) styled with Tailwind via class-variance-authority

**Theming**: `ThemeProvider` wraps the app, uses `next-themes` with `useThemeStore` for persistence

**Data Fetching**: Components use SWR hooks or direct Firestore listeners for real-time updates

**Forms**: Controlled components with local state, validated before submission

### Path Aliases

TypeScript paths configured with `@/*` mapping to `src/*`. Always use absolute imports:

```typescript
import { db } from "@/lib/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
```

### Styling

- Tailwind CSS 4.1.5 with custom config
- `tw-animate-css` for animations
- Responsive mobile-first design
- Dark mode support via `next-themes`

### Environment Variables

Firebase configuration in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

All Firebase env vars must be prefixed with `NEXT_PUBLIC_` for client-side access.

## Important Notes

- This is a French-language application - all UI text, comments, and commit messages are in French
- Restaurant context is required for most operations - always check `selectedRestaurant` from `useAppStore`
- Firestore timestamps use Firebase `Timestamp` type, not JavaScript `Date`
- All currency amounts are in euros (€)
- The cloture system expects Zelty POS integration data
- User permissions are role-based - check `role` and `isAdmin` flags before allowing operations
