# TimeFlow Mobile App

TimeFlow is a comprehensive productivity application built with React Native and Expo. It helps users manage their time, tasks, finances, habits, and job applications in one unified interface.

## Features

### 📅 Tasks
- **Task Management**: Create, edit, and delete tasks with priorities (Low, Medium, High).
- **Subtasks & AI Breakdown**: Break down complex tasks into subtasks manually or using AI.
- **Views**: Switch between List and Calendar views.
- **Filtering**: Organize tasks by status (Backlog, Today, In Progress, Completed).

### 💰 Finance
- **Transaction Tracking**: Log income and expenses with categories.
- **Budgets**: Set monthly budgets for different categories and track progress.
- **Visual Summaries**: View monthly income, expense, and total balance at a glance.

### 📝 Notes
- **Rich Note Taking**: Create and organize notes with titles and content.
- **AI Summarization**: Automatically summarize long notes using AI.
- **Organization**: Color-code notes, add tags, and pin important ones.

### 🔄 Habits
- **Habit Tracking**: Build and track daily or custom habits.
- **Streaks**: Visualize your progress with streak counters.
- **Weekly View**: Quick view of your habit completion for the current week.

### 💼 Jobs
- **Application Tracker**: Manage your job search with a dedicated board.
- **Status Pipeline**: Track applications from Wishlist to Offer/Rejected.
- **Link Parsing**: Auto-fill job details by pasting links from LinkedIn or Naukri.

### 👤 Profile & Gamification
- **User Stats**: Track total hours, completed tasks, and current streaks.
- **Leveling System**: Earn XP and level up as you complete tasks and habits.
- **Badges**: Unlock achievements for your milestones.
- **Customization**: Dark/Light mode support and profile management.

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Networking**: Axios
- **Styling**: StyleSheet (React Native)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your mobile device (or Android/iOS emulator)

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go (Android) or use the Camera app (iOS).

## Project Structure

- `app/`: Main application screens and routing (Expo Router).
  - `(tabs)/`: Main tab navigation (Tasks, Finance, Notes, Jobs, Habits, Profile).
  - `(auth)/`: Authentication screens (Login, Signup).
- `components/`: Reusable UI components.
- `store/`: Zustand stores for state management (`taskStore`, `financeStore`, etc.).
- `services/`: API configuration and helper functions.
- `assets/`: Images and fonts.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
