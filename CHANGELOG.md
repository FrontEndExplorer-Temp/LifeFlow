# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-11-25

### Added
- **User Experience**
  - Gender-specific avatars (Male/Female) with distinct color themes
  - Improved Onboarding flow with "Skip" option handling
  - Dynamic navigation based on onboarding status

- **Backend Security & Validation**
  - Input validation middleware for all user routes
  - Dynamic SMTP configuration for email services
  - Enhanced error handling for invalid inputs

### Fixed
- **Navigation**
  - Resolved infinite loop in avatar selection for skipped users
  - Fixed "GO_BACK was not handled" error in profile edit
  - Corrected gender persistence in user profile

## [1.1.0] - 2025-11-23

### Added
- **Admin Features**
  - Admin Dashboard for user management
  - Ability to view and delete users
  - Admin-only route protection

- **Advanced Authentication**
  - Email verification workflow
  - Secure "Forgot Password" & Reset flow
  - OAuth integration (Google/GitHub)
  - Enhanced security with middleware

- **Task Enhancements**
  - Rich task details: Priority, Tags, Subtasks, Due Dates
  - Visual indicators for overdue tasks and priorities
  - Improved Task Card UI

- **Job Application Tracker**
  - Smart Link Parsing (LinkedIn, Naukri) for auto-filling job details

- **UI/UX Polish**
  - Global Dark Mode support
  - Centralized Theme System
  - Consistent styling across all modules
  - Responsive design improvements

### Fixed
- **Web Compatibility**
  - Resolved "Unexpected text node" crashes on web
  - Fixed deprecated `shadow*` prop warnings
  - Improved cross-platform rendering

## [1.0.0] - 2024-01-21

### Added
- **Phase 1: Core System & Infrastructure**
  - Authentication module with JWT
  - Time tracking engine with pause/resume
  - Data aggregation and period snapshots
  - Daily summary dashboard
  - Automated cron jobs for midnight processing

- **Phase 2: Productivity Modules**
  - Task manager with Kanban-style workflow
  - Job application tracker
  - Notes system with color coding and pinning

- **Phase 3: Life Modules**
  - Finance module with income/expense tracking
  - Budget management per category
  - Habit tracker with streak calculation

- **Phase 4: AI & Advanced Features**
  - Data retention system (90-day cleanup)
  - AI integration with Google Gemini
  - Daily plan generation
  - Task prioritization suggestions
  - Habit insights and recommendations
  - Multi-device sync optimization
  - Offline queue support

### Technical Improvements
- Platform-aware secure storage (SecureStore for native, AsyncStorage for web)
- Comprehensive error handling
- API interceptors for authentication
- Automated data cleanup
- Conflict resolution for multi-device sync

### Documentation
- Complete README with setup instructions
- API documentation
- Contributing guidelines
- Code comments and inline documentation

---

## Future Releases

### [1.2.0] - Planned
- Push notifications for reminders
- Calendar integration
- Biometric authentication
- Data export (PDF/CSV)
- Advanced analytics and charts
- Team collaboration features

### [1.2.0] - Planned
- Data export (PDF/CSV)
- Advanced analytics and charts
- Team collaboration features
- Web dashboard

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backwards compatible manner
- PATCH version for backwards compatible bug fixes
