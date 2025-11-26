# Implementation Plan - Gamification (XP, Levels, Badges)

## Goal
Implement a gamification system to motivate users by awarding XP (Experience Points) for actions and unlocking Badges for milestones.

## User Review Required
> [!IMPORTANT]
> **Schema Change**: The `User` model will be updated to include `xp`, `level`, and `badges` array.
> **Logic**: XP and Badges will be calculated on the backend when specific actions occur (Task Completion, Habit Check, etc.).

## Proposed Changes

### Backend

#### [MODIFY] [userModel.js](file:///d:/Purushothaman/time_managment/backend/models/userModel.js)
- Add `xp` (Number, default 0).
- Add `level` (Number, default 1).
- Add `badges` (Array of Strings or Objects with date).

#### [NEW] [gamificationService.js](file:///d:/Purushothaman/time_managment/backend/services/gamificationService.js)
- `addXP(userId, amount)`: Adds XP, checks for level up.
- `checkBadges(userId, actionType, data)`: Checks if any new badges are unlocked based on the action.
- **Badge Definitions**:
    1.  **First Step**: Complete 1st task.
    2.  **Task Slayer**: Complete 50 tasks.
    3.  **Early Bird**: Complete task before 8 AM.
    4.  **Night Owl**: Complete task after 10 PM.
    5.  **Weekend Warrior**: Complete task on Sat/Sun.
    6.  **Habit Starter**: 3-day habit streak.
    7.  **Streak Master**: 7-day habit streak.
    8.  **Habit Hero**: 30-day habit streak.
    9.  **Note Taker**: Create 10 notes.
    10. **Job Hunter**: Apply to 5 jobs.
    11. **Focus Master**: Accumulate 10 hours of focus time.
    12. **Money Manager**: Add 10 transactions.

#### [MODIFY] Controllers
- `taskController.js`: Call `gamificationService` on task completion.
- `habitController.js`: Call `gamificationService` on habit toggle.
- `jobController.js`: Call `gamificationService` on job add/update.
- `noteController.js`: Call `gamificationService` on note creation.
- `transactionController.js`: Call `gamificationService` on transaction add.

### Frontend

#### [MODIFY] [authStore.js](file:///d:/Purushothaman/time_managment/mobile-app/store/authStore.js)
- Update user state to include `xp`, `level`, `badges`.
- Handle "Level Up" or "Badge Unlocked" events (maybe via response data or separate fetch).

#### [NEW] [Badges.jsx](file:///d:/Purushothaman/time_managment/mobile-app/components/Badges.jsx)
- A component to display the grid of badges (locked vs unlocked).

#### [MODIFY] [profile.jsx](file:///d:/Purushothaman/time_managment/mobile-app/app/(tabs)/profile.jsx)
- Display User Level and XP Progress Bar.
- Render the `Badges` component.

## Verification Plan

### Automated Tests
- None planned for this phase.

### Manual Verification
1.  **XP Gain**: Complete a task -> Verify XP increases in DB/UI.
2.  **Level Up**: Manually set XP near threshold -> Complete task -> Verify Level increases.
3.  **Badge Unlock**:
    - Create a task at 7 AM -> Verify "Early Bird" badge.
    - Complete 3 days of habits -> Verify "Habit Starter".
