import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-aware secure storage
 * Uses SecureStore for native (iOS/Android) and AsyncStorage for web
 */

export const secureStorage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            return await AsyncStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },

    async setItem(key, value) {
        if (Platform.OS === 'web') {
            return await AsyncStorage.setItem(key, value);
        }
        return await SecureStore.setItemAsync(key, value);
    },

    async removeItem(key) {
        if (Platform.OS === 'web') {
            return await AsyncStorage.removeItem(key);
        }
        return await SecureStore.deleteItemAsync(key);
    },
};

export default secureStorage;
