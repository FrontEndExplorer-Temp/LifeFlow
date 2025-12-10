# TimeFlow Mobile App

TimeFlow Mobile is the core companion for your productivity on the go. Built with React Native and Expo, it provides a seamless, touch-optimized experience for managing your entire life system—tasks, finances, habits, and jobs—even when you're offline.

## 🚀 Features

### Core Productivity
*   **📅 Tasks**: Full task management with priorities, subtasks, and AI-powered breakdown.
*   **📝 Notes**: Rich note creation with color coding, pinning, and tagging support.
*   **🤖 AI Integration**: Generate daily plans, summarize notes, and break down complex tasks using Gemini AI.

### Life Management
*   **💰 Finance**: Track daily expenses and income, manage monthly budgets, and view visual spending summaries.
*   **🌱 Habits**: Build lasting habits with daily tracking, streaks, and weekly consistency views.
*   **💼 Jobs**: Manage your career search with a Kanban-style job application board and link parsing.

### Gamification & Profile
*   **🏆 Leveling System**: Earn XP for completing tasks and habits to level up your productivity profile.
*   **🏅 Badges**: Unlock achievements for consistency and milestones.
*   **📊 Statistics**: View your all-time stats, total focus hours, and completion rates.

## 🛠️ Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/) (v0.81) via [Expo](https://expo.dev/) (SDK 54)
*   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Networking**: [Axios](https://axios-http.com/)
*   **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (Offline persistence)
*   **Date Handling**: [dayjs](https://day.js.org/)
*   **Notifications**: Expo Notifications

## 📱 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   Expo Go app installed on your physical device (Android/iOS) OR an Emulator/Simulator set up.

### Installation

1.  **Navigate to the directory**:
    ```bash
    cd mobile-app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file for API configuration (replace with your backend IP):
    ```env
    EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api
    ```

4.  **Start the app**:
    ```bash
    npx expo start
    ```

5.  **Run on Device**:
    *   **Physical Device**: Scan the QR code using the Expo Go app.
    *   **Android Emulator**: Press `a` in the terminal.
    *   **iOS Simulator**: Press `i` in the terminal (macOS only).

## 📂 Project Structure

```
mobile-app/
├── app/                # Expo Router file-based navigation
│   ├── (tabs)/         # Main bottom tab screens (index, tasks, finance...)
│   ├── (auth)/         # Auth stack (login, signup)
│   └── _layout.jsx     # Root layout and context providers
├── components/         # Reusable UI components
├── services/           # API services (api.js, authService.js)
├── store/              # Zustand global state stores
├── constants/          # App-wide constants (colors, theme)
└── assets/             # Static images and fonts
```

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add NewFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ISC License.
