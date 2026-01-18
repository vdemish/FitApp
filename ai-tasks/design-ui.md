# UI Design Migration Plan: From Web to React Native

Migrate the rich glassmorphism UI design from the old web-based project (`/old/`) to the current React Native implementation, maintaining visual fidelity for both dark and light themes.

---

## Analysis Summary

### Old Design (Web - `/old/`)
- **Tech**: React + Tailwind CSS with custom `liquid-glass` effects
- **Components**: `GlassCard`, `Button` (4 variants), `Input`, `Text`/`Heading`/`Label`
- **Features**: Dark/light themes, backdrop-blur, subtle shadows, neo-glow effects
- **Screens**: WorkoutScreen, LibraryScreen, HistoryScreen, ProfileScreen, LoginScreen

### Current State (React Native - `/src/`)
- **Theme tokens**: Already migrated to `src/theme/` (colors, typography, spacing)
- **Screens**: Placeholder implementations with basic styling
- **Missing**: Reusable UI components, glassmorphism effects, full screen designs

---

## Implementation Plan

### Phase 1: UI Component Library

Create reusable components in `src/components/ui/`:

#### [NEW] GlassCard.tsx
Glassmorphism container with blur effect
- Props: `children`, `glow?`, `accent?` (primary/success/purple/none), `style?`, `onPress?`
- Uses `@react-native-community/blur` for iOS, fallback rgba for Android
- Border, shadow, and accent bar support

#### [NEW] Button.tsx
Button with 4 variants matching old design
- Variants: `primary`, `secondary`, `ghost`, `icon`
- Sizes: `sm`, `md`, `lg`
- Props: `glow?`, `fullWidth?`, `disabled?`
- Active scale animation (scale 0.98)

#### [NEW] Input.tsx
Styled text input with icon support
- Props: `icon?`, `placeholder`, `error?`, `disabled?`
- Glass background, focus states

#### [NEW] Text.tsx
Typography components
- `Heading`: `level` 1-3, `accent?`
- `Text`: `variant` (display/body/body-sm/caption), `muted?`, `accent?`, `uppercase?`
- `Label`: Uppercase, tracking-wide, muted

#### [NEW] index.ts
Export all components

---

### Phase 2: Theme Extensions

#### [MODIFY] src/theme/index.ts
Add missing design tokens:
- `effects`: shadow definitions (light/dark/primary glow)
- `radius`: consistent border radius values
- `sizes`: touch targets, button heights

---

### Phase 3: Screen Implementations

Each screen will be fully redesigned with data binding and original design patterns.

#### [MODIFY] WorkoutScreen.tsx
From `/old/components/WorkoutScreen.tsx`:
- Rest timer card with glow effect and time display
- Exercise info header with history hint
- Main logging card with set indicators, weight/reps inputs (increment/decrement)
- "Log Set" button with neo-glow
- "Up Next" preview card
- "Add Set" dashed button
- Floating action bar for "Finish Workout"

**Data binding**: Current workout session, exercise list, set history from database

#### [MODIFY] LibraryScreen.tsx
From `/old/components/LibraryScreen.tsx`:
- Header with title and add button
- Search input
- Category filter pills (horizontal scroll)
- "Commonly Used" section with GlassCards
- "A-Z" section with exercise list

**Data binding**: Exercises from database, user favorites

#### [MODIFY] HistoryScreen.tsx
From `/old/components/HistoryScreen.tsx`:
- Header with "Analytics Dashboard" subtitle
- Volume chart card with SVG/Victory chart and glow
- Calendar card with workout day indicators
- Recent logs list with GlassCards

**Data binding**: Workout history, volume stats from database

#### [MODIFY] ProfileScreen.tsx
From `/old/components/ProfileScreen.tsx`:
- Profile header card with avatar, name, membership badge
- Stats row (workouts, weight, streak)
- Account Settings section
- App Preferences section with toggle switches
- Version info footer
- Sign out button

**Data binding**: User profile, workout stats from database

#### [MODIFY] LoginScreen.tsx
From `/old/components/LoginScreen.tsx`:
- Dynamic gradient background
- Logo and animated icon
- GlassCard form container
- Styled inputs with icons
- OAuth buttons (Google, Apple) with icons
- Error display
- Mode toggle (sign in/sign up)

---

### Phase 4: Additional Components

#### [NEW] NavItem.tsx
Bottom tab icon component with active state
- Props: `icon`, `label`, `active`, `onPress`
- Active: scale 1.1, primary color, pulse dot

#### [NEW] CategoryPill.tsx
Filter button for LibraryScreen
- Props: `label`, `active`, `onPress`
- Active: primary bg, inactive: glass bg

#### [NEW] IncrementDecrementInput.tsx
Numeric input with large +/- buttons (from WorkoutScreen)
- Props: `value`, `onChange`, `step?`, `min?`, `label`
- 64x64 circular buttons for easy touch

#### [NEW] RestTimerCard.tsx
Reusable rest timer component
- Props: `seconds`, `onAdd`, `onSubtract`
- Display format: MM:SS
- Glow effect when active

---

## Dependencies to Add

```bash
npm install @react-native-community/blur react-native-svg victory-native
```

- `@react-native-community/blur`: iOS blur effects for glassmorphism
- `react-native-svg`: SVG support for icons and charts
- `victory-native`: Chart library for HistoryScreen analytics

---

## Dark/Light Theme Strategy

1. Create `useTheme` hook returning `isDark` boolean
2. Create `useThemedStyles` hook pattern for conditional styles
3. Update all components to use theme-aware colors
4. Add theme toggle button in header (same as old design)

---

## Verification Plan

### Visual Testing
1. Compare each screen side-by-side with old web version screenshots
2. Test both dark and light themes
3. Verify on iPhone simulator and Android emulator

### Manual Testing Checklist
- [ ] WorkoutScreen: Timer displays, weight/reps adjust, set logging works
- [ ] LibraryScreen: Search filters, category pills toggle, exercise list scrolls
- [ ] HistoryScreen: Chart renders, calendar month navigates, logs clickable
- [ ] ProfileScreen: Avatar shows initials, settings rows clickable, sign out works
- [ ] LoginScreen: Form validates, sign in/up works, OAuth buttons visible

### Component Testing
- Run `npm test` after adding component unit tests for:
  - Button variants render correctly
  - GlassCard applies accent borders
  - Input handles focus states

---

## Phase 5: Unit Tests

Create tests in `__tests__/` directory for all new and modified components/screens.

### Component Tests (`__tests__/components/ui/`)

#### [NEW] GlassCard.test.tsx
- Renders children correctly
- Applies glow effect when `glow={true}`
- Applies accent border for each variant (primary/success/purple)
- Handles `onPress` callback
- Applies custom styles

#### [NEW] Button.test.tsx
- Renders all variants (primary/secondary/ghost/icon)
- Renders all sizes (sm/md/lg)
- Applies glow effect
- Handles `disabled` state
- Handles `fullWidth` prop
- Triggers `onPress` callback

#### [NEW] Input.test.tsx
- Renders with placeholder text
- Displays icon when provided
- Handles text input changes
- Shows error state styling
- Handles disabled state
- Handles focus/blur events

#### [NEW] Text.test.tsx
- Heading renders all levels (1/2/3)
- Text renders all variants (display/body/body-sm/caption)
- Applies accent color
- Applies muted style
- Applies uppercase transform
- Label renders with correct styling

### Additional Component Tests (`__tests__/components/`)

#### [NEW] CategoryPill.test.tsx
- Renders label text
- Shows active state styling
- Shows inactive state styling
- Triggers `onPress` callback

#### [NEW] IncrementDecrementInput.test.tsx
- Displays current value
- Increments value on + press
- Decrements value on - press
- Respects min value
- Applies custom step value
- Displays label

#### [NEW] RestTimerCard.test.tsx
- Displays time in MM:SS format
- Triggers onAdd callback
- Triggers onSubtract callback
- Shows glow effect

#### [NEW] NavItem.test.tsx
- Renders icon and label
- Shows active state styling
- Shows inactive state styling
- Triggers `onPress` callback

### Screen Tests (`__tests__/screens/`)

#### [NEW] LoginScreen.test.tsx
- Renders sign-in form by default
- Toggles to sign-up form
- Shows name input only in sign-up mode
- Validates email field
- Validates password minimum length
- Shows error messages
- Disables submit when invalid
- Shows loading state
- Calls signIn on submit (sign-in mode)
- Calls signUp on submit (sign-up mode)

#### [NEW] WorkoutScreen.test.tsx
- Renders rest timer card
- Renders exercise info
- Renders set logging card
- Increments/decrements weight
- Increments/decrements reps
- Renders "Log Set" button
- Renders "Up Next" preview
- Renders "Add Set" button

#### [NEW] LibraryScreen.test.tsx
- Renders search input
- Renders category pills
- Filters exercises by category
- Renders exercise list
- Displays "Commonly Used" section
- Displays "A-Z" section

#### [NEW] HistoryScreen.test.tsx
- Renders volume chart
- Renders calendar component
- Renders recent logs list
- Displays correct date range
- Handles month navigation

#### [NEW] ProfileScreen.test.tsx
- Renders user avatar with initials
- Renders user name and email
- Renders stats row (workouts, weight, streak)
- Renders settings sections
- Handles sign out button press
- Renders version info

---

## Execution Order

1. Phase 1: UI Component Library (foundation)
2. Phase 4: Additional Components (specialized)
3. Phase 2: Theme Extensions (tokens)
4. Phase 3: Screen Implementations (one at a time)
   - LoginScreen (auth entry point)
   - WorkoutScreen (main feature)
   - LibraryScreen
   - HistoryScreen
   - ProfileScreen
5. **Phase 5: Unit Tests** (after each component/screen implementation)

> [!TIP]
> Write tests incrementally: after implementing each component, immediately add its tests before moving to the next.

---

## Estimated Effort

| Phase | Items | Complexity |
|-------|-------|------------|
| 1 | 5 components | Medium |
| 2 | Theme updates | Low |
| 3 | 5 screens | High |
| 4 | 4 components | Medium |
| 5 | 14 test files | Medium |

**Total**: ~4-5 development sessions
