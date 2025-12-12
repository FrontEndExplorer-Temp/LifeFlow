import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import secureStorage from './secureStorage';

const getBaseUrl = () => {
    let url = null;

    // 1. First check for EXPO extra (set via app.config.js / EAS build)
    const expoExtraApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || Constants.manifest?.extra?.EXPO_PUBLIC_API_URL;
    if (expoExtraApiUrl) {
        url = expoExtraApiUrl;
    }
    // 2. Check for production API URL from environment variable
    else if (process.env.EXPO_PUBLIC_API_URL) {
        url = process.env.EXPO_PUBLIC_API_URL;
    }
    // 3. For web, localhost is fine
    else if (Platform.OS === 'web') {
        url = 'http://localhost:5000/api';
    }
    // 4. For physical devices, we need the local IP
    else {
        const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
        if (hostUri) {
            const ip = hostUri.split(':')[0];
            url = `http://${ip}:5000/api`;
        } else if (Platform.OS === 'android') {
            url = 'http://10.0.2.2:5000/api';
        } else {
            url = 'http://localhost:5000/api';
        }
    }

    // Global Fix for SSL Protocol Error on localhost:
    // If the URL points to localhost but uses HTTPS, force it to HTTP.
    if (url && url.includes('localhost') && url.startsWith('https://')) {
        url = url.replace('https://', 'http://');
    }

    return url;
};

const API_URL = getBaseUrl();
console.log('API URL configured as:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await secureStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API_URL };
export default api