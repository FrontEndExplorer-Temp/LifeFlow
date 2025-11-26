import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const LAST_SYNC_KEY = '@last_sync';

/**
 * Monitor network status
 */
export const subscribeToNetworkStatus = (callback) => {
    return NetInfo.addEventListener(state => {
        callback(state.isConnected);
    });
};

/**
 * Get offline queue
 */
export const getOfflineQueue = async () => {
    try {
        const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Error reading offline queue:', error);
        return [];
    }
};

/**
 * Add operation to offline queue
 */
export const addToOfflineQueue = async (operation) => {
    try {
        const queue = await getOfflineQueue();
        queue.push({
            ...operation,
            timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Error adding to offline queue:', error);
    }
};

/**
 * Clear offline queue
 */
export const clearOfflineQueue = async () => {
    try {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
        console.error('Error clearing offline queue:', error);
    }
};

/**
 * Get last sync timestamp
 */
export const getLastSync = async () => {
    try {
        const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
        return lastSync || null;
    } catch (error) {
        console.error('Error reading last sync:', error);
        return null;
    }
};

/**
 * Set last sync timestamp
 */
export const setLastSync = async (timestamp) => {
    try {
        await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
    } catch (error) {
        console.error('Error setting last sync:', error);
    }
};

export default {
    subscribeToNetworkStatus,
    getOfflineQueue,
    addToOfflineQueue,
    clearOfflineQueue,
    getLastSync,
    setLastSync,
};
