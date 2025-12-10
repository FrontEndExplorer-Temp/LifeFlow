# Contributing to TimeFlow

Thank you for your interest in contributing to the TimeFlow Life Management System! We welcome contributions from the community to help make this project better.

## 🤝 Code of Conduct

Please maintain a respectful and inclusive environment. We expect all contributors to adhere to our Code of Conduct:
*   Be respectful and constructive in feedback.
*   Focus on what is best for the project and community.
*   Show empathy towards other community members.

## 🚀 How to Contribute

### Reporting Bugs
1.  **Search**: Check existing issues to matching bugs.
2.  **Report**: Open a new issue with:
    *   Clear title and description.
    *   Steps to reproduce.
    *   Expected vs Actual behavior.
    *   Screenshots (if applicable).

### Feature Requests
1.  **Search**: Check if the feature has already been suggested.
2.  **Propose**: Open a new issue with detailed use cases and implementation ideas.

### Pull Requests
1.  **Fork** the repository to your GitHub account.
2.  **Clone** your fork locally.
3.  **Branch** off `main` for your feature/fix:
    ```bash
    git checkout -b feature/my-new-feature
    # or
    git checkout -b fix/login-bug
    ```
4.  **Commit** your changes following [Conventional Commits](#-commit-convention).
5.  **Push** to your fork.
6.  **Open PR**: Submit a Pull Request to the `main` branch of this repository.

## 💻 Development Setup

This is a monorepo containing three main parts. Follow the setup for the specific area you are working on:

### 1. Backend API (`/backend`)
```bash
cd backend
npm install
# Set up .env as per backend/README.md
npm run dev
```

### 2. Client Web (`/client-web`)
```bash
cd client-web
npm install
npm run dev
```

### 3. Mobile App (`/mobile-app`)
```bash
cd mobile-app
npm install
npx expo start
```

## 📝 Commit Convention

We follow the **Conventional Commits** specification. Please format your commit messages as follows:

```
<type>(<scope>): <subject>
```

**Types:**
*   `feat`: A new feature
*   `fix`: A bug fix
*   `docs`: Documentation only changes
*   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   `refactor`: A code change that neither fixes a bug nor adds a feature
*   `perf`: A code change that improves performance
*   `test`: Adding missing tests or correcting existing tests
*   `chore`: Changes to the build process or auxiliary tools

**Examples:**
*   `feat(auth): add google oauth integration`
*   `fix(notes): resolve text overflow in note cards`
*   `docs(readme): update backend api documentation`
*   `style(ui): unify header styles across pages`

## 📂 Project Structure

```
TimeFlow/
├── backend/            # Express.js API Server
│   ├── routes/         # API Endpoints
│   ├── controllers/    # Business Logic
│   └── models/         # Database Schemas
├── client-web/         # React + Vite Web Dashboard
│   ├── src/pages/      # Web Routes/Views
│   └── src/components/ # Reusable UI Components
└── mobile-app/         # React Native + Expo App
    ├── app/            # Mobile Navigations (Tabs)
    └── components/     # Mobile UI Components
```

## ✅ Definition of Done

Before submitting your PR, ensure:
1.  Code follows the project's style guidelines.
2.  No console errors or warnings.
3.  Documentation updated (if relevant).
4.  App builds and runs successfully on target platforms.

Thank you for your contribution! 🎉
