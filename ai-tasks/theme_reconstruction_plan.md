# FitApp Theme Reconstruction Plan

> **Audit Date**: January 18, 2026  
> **Status**: Analysis Complete — Implementation Pending

---

## Summary

The application exhibits "partial Light Mode" behavior because:
1. **Dual color sources** (`colors.ts` and `tailwind.config.js`) are not synchronized
2. **NativeWind colorScheme** is not programmatically toggled when theme changes
3. **Static dark-mode classes** are used without `dark:` prefix companions
4. **StyleSheet colors** reference `colors.*.dark` directly instead of using `useThemeColors()`
5. **Navigation/StatusBar** ignore the active theme state

---

## 1. Conflict Map

### Discrepancies Between `colors.ts` and `tailwind.config.js`

| Token Path | `colors.ts` | `tailwind.config.js` | Issue |
|------------|-------------|----------------------|-------|
| `background.light` | `#F3F7FF` | `#F0F4FF` | **Mismatch** — 3-digit difference |
| `primary.light` | `#4f46e5` | `#4F46E5` | Case difference (cosmetic) |
| `surface.*` | Defined | **Missing** | Not in Tailwind config |
| `text.*` | Defined (nested dark/light) | **Missing** | Not in Tailwind config |
| `border.*` | Defined | **Missing** | Not in Tailwind config |
| `success` | `#10b981` | **Missing** | Not in Tailwind config |
| `error` | `#ef4444` | **Missing** | Not in Tailwind config |
| `tabBar.*` | Defined | **Missing** | Not in Tailwind config |
| `subscription.*` | Defined | **Missing** | Not in Tailwind config |
| `input.*` | Defined | **Missing** | Not in Tailwind config |

> [!WARNING]
> **Critical**: `tailwind.config.js` does not import from `colors.ts`. Colors are manually duplicated.

---

## 2. Hardcode Registry

### NativeWind Classes Without `dark:` Prefix Pairs

| File | Line | Problematic Class | Issue |
|------|------|-------------------|-------|
| [ProfileEditorModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/ProfileEditorModal.tsx) | 125 | `bg-background-dark` | Static dark background |
| [ProfileEditorModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/ProfileEditorModal.tsx) | 175 | `bg-white/5`, `text-white` | Forces dark appearance |
| [ProfileEditorModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/ProfileEditorModal.tsx) | 132 | `text-white` | No light mode class |
| [ProfileEditorModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/ProfileEditorModal.tsx) | 167 | `text-white/60` | No light mode class |
| [AppSettingsModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/AppSettingsModal.tsx) | 126 | `bg-background-dark` | Static dark background |
| [AppSettingsModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/AppSettingsModal.tsx) | 144 | `bg-white/5` | Forces dark appearance |
| [AppSettingsModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/AppSettingsModal.tsx) | 130 | `text-white` | No light mode class |
| [AppSettingsModal.tsx](file:///Users/vdemish/apps/FitApp/src/components/AppSettingsModal.tsx) | 189 | `bg-white/5`, `text-white` | Forces dark appearance |

### StyleSheet Using Static `colors.*.dark` Values

| File | Lines | Pattern | Count |
|------|-------|---------|-------|
| [LoginScreen.tsx](file:///Users/vdemish/apps/FitApp/src/screens/LoginScreen.tsx) | 227-353 | `colors.background.dark`, `colors.text.primary.dark` | 10+ |
| [ProfileScreen.tsx](file:///Users/vdemish/apps/FitApp/src/screens/ProfileScreen.tsx) | 270-420 | `colors.background.dark`, `colors.surface.dark` | 15+ |
| [TabNavigator.tsx](file:///Users/vdemish/apps/FitApp/src/navigation/TabNavigator.tsx) | 49-53 | `colors.tabBar.inactive`, `colors.tabBar.background` | 4 |
| [RootNavigator.tsx](file:///Users/vdemish/apps/FitApp/src/navigation/RootNavigator.tsx) | 33-36 | `colors.background.dark` | 2 |
| [NavItem.tsx](file:///Users/vdemish/apps/FitApp/src/components/NavItem.tsx) | 66-101 | `colors.text.muted.dark` | 4 |

> [!NOTE]
> `useThemeColors()` hook exists but is imported in only 2 of 6 screens (`LoginScreen`, `ProfileScreen`) and **not utilized** in their StyleSheets.

---

## 3. Critical Fixes

### 3.1 Theme Switcher Logic Gaps

| Component | Issue | Impact |
|-----------|-------|--------|
| [App.tsx](file:///Users/vdemish/apps/FitApp/App.tsx#L20) | `NavigationContainer` has **no theme prop** | System navigation backgrounds stay dark |
| [App.tsx](file:///Users/vdemish/apps/FitApp/App.tsx#L24) | `StatusBar style="light"` is **hardcoded** | Status bar text always light |
| [SettingsContext.tsx](file:///Users/vdemish/apps/FitApp/src/context/SettingsContext.tsx) | **No NativeWind `setColorScheme()` call** | Tailwind `dark:` classes don't toggle |

### 3.2 Components Causing "Partial Light Mode"

| Priority | Component | Required Fix |
|----------|-----------|--------------|
| **P0** | `App.tsx` | Pass dynamic theme to `NavigationContainer` and `StatusBar` |
| **P0** | `SettingsContext.tsx` | Add `useColorScheme()` from NativeWind to sync theme |
| **P1** | `ProfileEditorModal.tsx` | Replace `bg-background-dark` → `bg-background-light dark:bg-background-dark` |
| **P1** | `AppSettingsModal.tsx` | Replace static `text-white` → `text-slate-900 dark:text-white` |
| **P1** | `TabNavigator.tsx` | Use `useThemeColors()` for tabBar colors |
| **P2** | All StyleSheet-based screens | Migrate from `colors.*.dark` to `themeColors.*` |

---

## 4. Refactoring Plan

### Step 1: Merge `colors.ts` into `tailwind.config.js`

```javascript
// tailwind.config.js
const { colors } = require('./src/theme/colors');

module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Spread the entire colors object
        ...colors,
        // Or selectively map for Tailwind compatibility:
        primary: colors.primary,
        background: colors.background,
        surface: colors.surface,
        accent: colors.accent,
        success: colors.success,
        error: colors.error,
        'text-primary': colors.text.primary,
        'text-secondary': colors.text.secondary,
        'text-muted': colors.text.muted,
        border: colors.border,
      },
    },
  },
  plugins: [],
};
```

> [!IMPORTANT]
> Convert `colors.ts` from TypeScript to CommonJS export for Tailwind compatibility, or create a separate `colors.cjs` file.

---

### Step 2: Fix Theme Switching in SettingsContext

```tsx
// SettingsContext.tsx
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

// Inside setTheme callback:
const setTheme = useCallback(async (theme: ThemeMode) => {
    const { setColorScheme } = useNativeWindColorScheme();
    
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    setState(prev => ({ ...prev, theme }));
    
    // Sync with NativeWind
    if (theme === 'system') {
        setColorScheme('system');
    } else {
        setColorScheme(theme);
    }
}, []);
```

---

### Step 3: Update App.tsx Navigation and StatusBar

```tsx
// App.tsx
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useSettings } from '@/context/SettingsContext';

export default function App() {
  const { activeTheme } = useSettings();
  
  const navigationTheme = activeTheme === 'dark' 
    ? DarkTheme 
    : DefaultTheme;
  
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AuthProvider>
          <SettingsProvider>
            <RootNavigator />
            <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
          </SettingsProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

> [!CAUTION]
> `useSettings()` must be called inside `SettingsProvider`. Refactor may require moving `SettingsProvider` above `NavigationContainer` or creating a wrapper component.

---

### Step 4: Component Migration Priority List

| Priority | Component | From → To |
|----------|-----------|-----------|
| **1** | `ProfileEditorModal.tsx` | `bg-background-dark` → `bg-background-light dark:bg-background-dark` |
| **2** | `AppSettingsModal.tsx` | `text-white` → `text-slate-900 dark:text-white` |
| **3** | `ProfileEditorModal.tsx` | `bg-white/5` → `bg-slate-100 dark:bg-white/5` |
| **4** | `TabNavigator.tsx` | Static `colors.tabBar.*` → `useThemeColors()` |
| **5** | `LoginScreen.tsx` | StyleSheet `colors.*.dark` → `themeColors.*` |
| **6** | `ProfileScreen.tsx` | StyleSheet `colors.*.dark` → `themeColors.*` |
| **7** | `NavItem.tsx` | Static `colors.text.muted.dark` → dynamic |
| **8** | Remaining screens | Apply `useThemeColors()` pattern |

---

## 5. Verification Checklist

After completing the refactoring:

- [ ] Toggle theme in settings → All backgrounds switch
- [ ] Toggle theme → All text colors switch
- [ ] Toggle theme → StatusBar style inverts
- [ ] Toggle theme → Tab bar colors update
- [ ] Toggle theme → Modal backgrounds switch
- [ ] Set theme to "System" → Follows device preference
- [ ] Restart app → Theme persists correctly

---

## Appendix: Files Requiring Changes

```
src/
├── context/
│   └── SettingsContext.tsx        ← Add NativeWind setColorScheme
├── hooks/
│   └── useThemeColors.ts          ← KEEP (already correct)
├── navigation/
│   ├── TabNavigator.tsx           ← Use useThemeColors
│   └── RootNavigator.tsx          ← Use useThemeColors
├── screens/
│   ├── LoginScreen.tsx            ← Migrate StyleSheet to themeColors
│   ├── ProfileScreen.tsx          ← Migrate StyleSheet to themeColors
│   ├── HistoryScreen.tsx          ← Audit needed
│   ├── LibraryScreen.tsx          ← Audit needed
│   ├── WorkoutScreen.tsx          ← Audit needed
│   └── SubscriptionScreen.tsx     ← Audit needed
├── components/
│   ├── ProfileEditorModal.tsx     ← Replace static dark: classes
│   ├── AppSettingsModal.tsx       ← Replace static dark: classes
│   └── NavItem.tsx                ← Use useThemeColors
└── theme/
    └── colors.ts                  ← Convert to CJS for Tailwind import

App.tsx                            ← Add NavigationContainer theme + dynamic StatusBar
tailwind.config.js                 ← Import from colors.ts
```
