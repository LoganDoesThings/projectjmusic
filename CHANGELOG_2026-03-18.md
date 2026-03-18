# Changelog - 2026-03-18 (Refactor & Polish)

## Summary
Comprehensive architectural refactor and code polish to improve maintainability, type safety, and project organization.

## Changes

### 📁 File Organization
- **Restructured `src/components`**: Organized components into logical subfolders (`modals/`, `player/`).
- **Created `src/hooks`**: Extracted complex logic from `App.tsx` into reusable custom hooks.
- **Created `src/utils`**: Centralized utility functions (formatting, metadata, IDs).
- **Created `src/types`**: Added `navigation.ts` for centralized navigation parameter lists and prop types.

### 🏗️ Code Refactoring
- **`App.tsx`**: Significantly reduced file size and complexity by delegating theme and sleep timer logic to `useTheme` and `useSleepTimer` hooks.
- **`useMusicStore.ts`**: 
    - Improved `playTrack` with better player instance management.
    - Enhanced `skipNext` shuffle logic to prevent immediate song repetition.
    - Added better error handling and alerts for playback failures.
- **TypeScript Improvements**: 
    - Replaced `any` types with strict `NativeStackScreenProps` and `BottomTabScreenProps` across all screens.
    - Added centralized navigation parameter types.

### 💄 Polish & UI
- **Formatting**: Centralized `formatTime` utility for consistent time display across the app.
- **Imports**: Updated all relative imports to match the new project structure.
- **Documentation**: Added JSDoc comments to major functions, hooks, and components for better developer experience.

## Impact
These changes do not introduce new features but significantly improve the "health" of the codebase, making it easier to scale and less prone to bugs related to state management or navigation.
