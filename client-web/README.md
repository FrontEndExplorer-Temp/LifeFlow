# TimeFlow Web Client

Overview
TimeFlow Web is your centralized control center for life management. Built as a companion to the TimeFlow mobile app, it offers a spacious, professional interface for deep work, planning, and tracking your life's progress.

## 🚀 Features

### Core Productivity
*   **🎯 Focus Mode**: Distraction-free timer with customizable sessions and ambient focus environment.
*   **✅ Task Management**: Full Kanban board and list views to manage projects, backlogs, and daily todos.
*   **📝 Notes**: Rich text note-taking with color coding, pinning, and AI summarization.
*   **⏱️ Timer**: Standalone Pomodoro timer with session tracking.

### Life Management
*   **💰 Finance Tracker**: Comprehensive dashboard for income/expense tracking, budgeting, and financial health visualization.
*   **🌱 Habit Tracker**: Monitor daily habits, track streaks, and visualize consistency over time.
*   **💼 Job Application Tracker**: Kanban board for managing your job search pipeline (Applied, Interview, Offer).

### Intelligence & System
*   **🧠 AI Integration**: Native integration with Google Gemini for generating daily plans, breaking down tasks, and summarizing notes.
*   **📊 Dashboard**: A high-level overview of your day, showing active tasks, financial snapshot, and habit progress.
*   **🔄 Real-time Sync**: Seamless synchronization with the mobile app and backend.
*   **🎨 adaptive UI**: Beautiful Light and Dark modes with a professional, minimal aesthetic.

## 🛠️ Tech Stack

*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Icons)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Forms**: [React Hook Form](https://react-hook-form.com/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **HTTP Client**: [Axios](https://axios-http.com/)
*   **Date Handling**: [date-fns](https://date-fns.org/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)

## ⚡ Getting Started

1.  **Navigate to the directory**:
    ```bash
    cd client-web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory (often not strictly required if using defaults, but good practice):
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
client-web/
├── src/
│   ├── components/     # Reusable UI components (buttons, modals, cards)
│   ├── layout/         # Layout wrappers (Sidebar, DashboardLayout)
│   ├── pages/          # Main route pages (Dashboard, Focus, Tasks, etc.)
│   ├── store/          # Zustand state stores (auth, tasks, notes, etc.)
│   ├── utils/          # Helper functions and formatters
│   ├── App.jsx         # Main application entry and routing
│   └── main.jsx        # React DOM rendering
├── public/             # Static assets
└── index.html          # HTML entry point
```

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/NewFeature`)
3.  Commit your changes (`git commit -m 'Add NewFeature'`)
4.  Push to the branch (`git push origin feature/NewFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ISC License.
