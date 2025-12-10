# Deployment Guide

This guide details how to deploy the **TimeFlow** full-stack application.
*   **Backend**: Node.js/Express (Render)
*   **Client Web**: React/Vite (Vercel)
*   **Mobile App**: React Native (Expo EAS)

---

## 🚀 Part 1: Backend Deployment (Render)

We recommend [Render](https://render.com) for hosting the Node.js backend.

### Steps
1.  **Push to GitHub**: Ensure your latest code is on GitHub.
2.  **New Web Service**:
    *   Go to [Render Dashboard](https://dashboard.render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your repository.
3.  **Configuration**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  **Environment Variables**:
    Add these key-value pairs in the "Environment" tab:
    *   `NODE_ENV`: `production`
    *   `MONGO_URI`: `your_mongodb_connection_string`
    *   `JWT_SECRET`: `your_secret_key`
    *   `GEMINI_API_KEY`: `your_gemini_key`
    *   `CLIENT_URL`: `https://your-web-app.vercel.app` (Add after deploying web)

---

## 🌐 Part 2: Web Client Deployment (Vercel)

We recommend [Vercel](https://vercel.com) for the React frontend.

### Steps
1.  **New Project**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** -> **Project**.
    *   Import your repository.
2.  **Configuration**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `client-web`
3.  **Environment Variables**:
    *   `VITE_API_URL`: `https://life-management-api.onrender.com/api` (Your backend URL)
4.  **Deploy**:
    *   Click **Deploy**.
    *   Once live, copy the URL and update your Backend's `CLIENT_URL` variable.

---

## 📱 Part 3: Mobile App Build (Expo EAS)

We use **EAS Build** to generate Android APKs and iOS IPAs.

### Prerequisites
*   Install EAS CLI: `npm install -g eas-cli`
*   Login: `eas login`

### Steps
1.  **Configure Build**:
    ```bash
    cd mobile-app
    eas build:configure
    ```
2.  **Update `eas.json` for APK**:
    Add this to your `eas.json` to enable direct APK downloads:
    ```json
    "build": {
      "preview": {
        "android": {
          "buildType": "apk"
        }
      }
    }
    ```
3.  **Set API URL**:
    Create or update `.env` in `mobile-app` (EAS supports .env):
    ```env
    EXPO_PUBLIC_API_URL=https://life-management-api.onrender.com/api
    ```
4.  **Build**:
    ```bash
    eas build -p android --profile preview
    ```
5.  **Download**:
    Use the link provided by EAS to download and install the APK.

---

## 🔄 Post-Deployment Checklist

1.  **CORS**: Ensure Backend `CLIENT_URL` matches your deployed Web URL.
2.  **Auth Callbacks**: Update Google/GitHub OAuth callback URLs in their developer consoles to point to your production backend.
3.  **Cron Jobs**: Render "Web Services" sleep on the free tier. For reliable cron jobs (daily summaries), consider upgrading to a paid instance or using a separate "Cron Job" service on Render.
