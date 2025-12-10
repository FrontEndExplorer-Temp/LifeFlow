# TimeFlow Backend

The backend API for the TimeFlow Life Management System. Built with Node.js, Express, and MongoDB, this service powers both the Web and Mobile clients, providing real-time data synchronization, AI integration, and comprehensive life management features.

## 🚀 Features

*   **Authentication**: Secure JWT-based auth with email/password and OAuth (Google/GitHub).
*   **Focus Timer**: Pomodoro-style timer with tracking and statistics.
*   **Task Management**: CRUD operations for tasks with priorities, subtasks, and Kanban/Calendar views.
*   **Notes**: Rich text notes with tagging, pinning, and AI summarization.
*   **Finance**: Expense tracking, budgeting, and visualizations.
*   **Habits**: Daily habit tracking with streaks and completion logs.
*   **Jobs**: Job application tracker to manage your career search.
*   **AI Integration**: Powered by Google Gemini for:
    *   Daily planning suggestions
    *   Task breakdown
    *   Note summarization
    *   Habit insights
*   **Synchronization**: robust sync capabilities for offline-first mobile usage.

## 🛠️ Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
*   **Authentication**: [Passport.js](https://www.passportjs.org/), JWT
*   **AI**: [Google Generative AI](https://ai.google.dev/) (Gemini)
*   **Email**: [SendGrid](https://sendgrid.com/) / [Nodemailer](https://nodemailer.com/)

## 📋 Prerequisites

*   Node.js (v18 or higher)
*   MongoDB (Local or Atlas)
*   npm or yarn

## ⚙️ Installation

1.  **Clone the repository** (if not already done):
    ```bash
    git clone <repository-url>
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # Database
    MONGO_URI=mongodb://localhost:27017/timeflow

    # Authentication
    JWT_SECRET=your_super_secret_jwt_key
    CLIENT_URL=http://localhost:5173

    # OAuth - Google
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

    # OAuth - GitHub
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

    # Email Service (SendGrid)
    SENDGRID_API_KEY=your_sendgrid_api_key
    EMAIL_FROM=noreply@timeflow.app

    # AI Integration (Google Gemini)
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Start the server**:
    *   **Development** (with nodemon):
        ```bash
        npm run dev
        ```
    *   **Production**:
        ```bash
        npm start
        ```

## 📂 Project Structure

```
backend/
├── config/             # Database and Passport configuration
├── controllers/        # Route handlers/Business logic
├── middleware/         # Auth and error handling middleware
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── services/           # External services (AI, Email, Sync)
├── utils/              # Helper functions
├── server.js           # Entry point
└── API_DOCS.md         # Detailed API endpoint references
```

## 📖 API Documentation

For a detailed list of all available endpoints, request bodies, and responses, please refer to the **[API_DOCS.md](./API_DOCS.md)** file.

**Key Endpoints:**
*   `POST /api/users/register` - User registration
*   `POST /api/users/login` - User login
*   `GET /api/tasks` - Get all tasks
*   `POST /api/ai/daily-plan` - Generate AI daily plan
*   `GET /api/sync/status` - Check sync status

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the ISC License.
