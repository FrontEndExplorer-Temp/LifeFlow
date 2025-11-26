# Deployment Guide

This guide covers the steps to deploy the backend to **Render** and build the mobile app APK using **Expo EAS**.

---

## 🚀 Part 1: Backend Deployment (Render)

We will use [Render](https://render.com) to host the Node.js/Express backend.

### Prerequisites
1.  A [GitHub](https://github.com) account.
2.  A [Render](https://render.com) account.
3.  Your project pushed to a GitHub repository.

### Steps

1.  **Create a New Web Service**
    *   Log in to your Render dashboard.
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure the Service**
    *   **Name**: `life-management-api` (or your preferred name)
    *   **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
    *   **Branch**: `main` (or your default branch).
    *   **Root Directory**: `backend` (Important! Since your backend is in a subfolder).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`

3.  **Environment Variables**
    *   Scroll down to the **Environment Variables** section.
    *   Click **Add Environment Variable** and add the following keys from your `.env` file:
        *   `NODE_ENV`: `production`
        *   `MONGO_URI`: `your_mongodb_atlas_connection_string`
        *   `JWT_SECRET`: `your_secure_jwt_secret`
        *   `SMTP_HOST`: `smtp.mailtrap.io` (or your provider)
        *   `SMTP_PORT`: `587`
        *   `SMTP_USER`: `your_smtp_user`
        *   `SMTP_PASSWORD`: `your_smtp_password`
        *   `SMTP_FROM_EMAIL`: `no-reply@yourdomain.com`
        *   `GEMINI_API_KEY`: `your_google_gemini_key`

4.  **Deploy**
    *   Click **Create Web Service**.
    *   Render will start building your app. Watch the logs for any errors.
    *   Once finished, you will get a URL like `https://life-management-api.onrender.com`.

---

## 📱 Part 2: Frontend Build (APK)

We will use **EAS Build** (Expo Application Services) to generate an APK file for Android.

### Prerequisites
1.  **EAS CLI**: Install it globally if you haven't already.
    ```bash
    npm install -g eas-cli
    ```
2.  **Expo Account**: Log in to your Expo account.
    ```bash
    eas login
    ```

### Steps

1.  **Configure EAS**
    *   Navigate to the mobile app directory:
        ```bash
        cd mobile-app
        ```
    *   Initialize EAS build:
        ```bash
        eas build:configure
        ```
    *   Select `Android` when prompted.
    *   This will create an `eas.json` file.

2.  **Update `eas.json` for APK**
    *   Open `eas.json` and modify the `build` section to include an `apk` profile:
    ```json
    {
      "build": {
        "preview": {
          "android": {
            "buildType": "apk"
          }
        },
        "production": {}
      }
    }
    ```

3.  **Update API URL**
    *   Before building, ensure your `services/api.js` points to your **deployed Render backend URL**, not localhost.
    *   Open `mobile-app/services/api.js`:
    ```javascript
    // const API_URL = 'http://localhost:5000/api'; // Comment this out
    const API_URL = 'https://life-management-api.onrender.com/api'; // Use your Render URL
    ```

4.  **Build the APK**
    *   Run the build command using the preview profile:
        ```bash
        eas build -p android --profile preview
        ```
    *   EAS will ask you to generate a Keystore. Select **Yes** to let EAS handle it for you.

5.  **Download**
    *   Wait for the build to complete (this happens in the cloud).
    *   Once done, you will get a link to download your `.apk` file.
    *   Install this file on your Android device to test.

---

## 🔄 Part 3: Connecting Frontend & Backend

1.  **Update Backend CORS (Optional)**
    *   If you face CORS issues, update your `backend/server.js` to allow requests from your mobile app or `*` (for development).

2.  **Test the Connection**
    *   Open the installed app.
    *   Try to Login or Register.
    *   If it works, your full-stack deployment is successful! 🎉
