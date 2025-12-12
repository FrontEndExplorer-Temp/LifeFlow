# TimeFlow - Life Management System

TimeFlow is a comprehensive, open-source productivity ecosystem designed to organize every aspect of your life. From deep work sessions and daily tasks to financial planning and career management, TimeFlow provides a synchronized, AI-powered experience across **Web** and **Mobile**.

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/React%20Native-0.76-blue?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/MongoDB-Latest-forestgreen?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Status-Maintained-orange?style=flat-square" alt="Status" />
</div>

---

## 🏗️ Architecture

This project is a monorepo divided into three specialized workspaces:

| Component | Description | Tech Stack | Documentation |
| :--- | :--- | :--- | :--- |
| **[Backend](./backend)** | The core API server handling business logic, auth, AI, and data sync. | Node.js, Express, MongoDB, Gemini AI | [Read Docs](./backend/README.md) |
| **[Client Web](./client-web)** | A responsive React dashboard for desktop/tablet use. | React, Vite, Tailwind CSS, Zustand | [Read Docs](./client-web/README.md) |
| **[Mobile App](./mobile-app)** | A native iOS/Android experience for tracking on the go. | React Native, Expo, NativeWind | [Read Docs](./mobile-app/README.md) |

---

## 🚀 Key Features

*   **⚡ Focus Mode**: Personalized timer with ambient modes and distraction-free sessions.
*   **✅ Task Management**: Powerful Kanban and list views with priorities and subtasks.
*   **🧠 AI Assistant**: Native Gemini integration for daily planning, task breakdown, and insights.
*   **📝 Smart Notes**: Rich text notes with color-coding, pinning, and AI summarization.
*   **💰 Finance Tracker**: Comprehensive income/expense tracking and budgeting.
*   **🌱 Habit Builder**: Daily habit tracking with streak visualization and gamification.
*   **💼 Job Tracker**: Manage your career search with a dedicated application pipeline.
*   **🛡️ Admin System**: Full control with Maintenance Mode, User Bans, Role Management, and Global AI Keys.
*   **🔄 Sync**: Real-time cross-device synchronization with offline support.

---

## 🏁 Quick Start

To get the entire system running locally:

### 1. Backend
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 2. Client Web
```bash
cd client-web
npm install
npm run dev
# Web App running at http://localhost:5173
```

### 3. Mobile App
```bash
cd mobile-app
npm install
npx expo start
# Scan QR code to run on device
```

For detailed setup instructions, please refer to the specific **README** in each directory.

---

## 📚 Documentation

*   **[Deployment Guide](./DEPLOYMENT.md)** - Instructions for deploying to Render, Vercel, and Play Store.
*   **[API Documentation](./backend/API_DOCS.md)** - Full reference for all backend endpoints.
*   **[Changelog](./CHANGELOG.md)** - History of changes and updates (Current: v1.3.0).

## 🤝 Contributing

We welcome contributions! Please see our **[Contributing Guidelines](./CONTRIBUTING.md)** for details on how to set up your environment, our code of conduct, and process for submitting pull requests.

## 📄 License

Copyright (c) 2025 TimeFlow Life Management System.
All Rights Reserved.
