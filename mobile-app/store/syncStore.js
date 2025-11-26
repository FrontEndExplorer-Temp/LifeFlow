import { create } from 'zustand';
import api from '../services/api';
import {
    subscribeToNetworkStatus,
    getOfflineQueue,
    clearOfflineQueue,
    getLastSync,
    setLastSync,
} from '../services/syncService';

const useSyncStore = create((set, get) => ({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,

    initialize: async () => {
        // Get last sync time
        const lastSync = await getLastSync();
        set({ lastSync });

        // Subscribe to network status
        subscribeToNetworkStatus(async (isOnline) => {
            set({ isOnline });

            // Auto-sync when coming back online
            if (isOnline) {
                await get().processOfflineQueue();
                await get().syncData();
            }
        });
    },

    getSyncStatus: async () => {
        try {
            const lastSync = await getLastSync();
            const response = await api.get('/sync/status', {
                params: { lastSync },
            });

            set({
                pendingChanges: response.data.pendingChanges.total,
                lastSync: response.data.serverTime,
            });

            return response.data;
        } catch (error) {
            console.error('Failed to get sync status:', error);
        }
    },

    syncData: async () => {
        if (get().isSyncing) return;

        set({ isSyncing: true });
        try {
            const lastSync = await getLastSync();
            const response = await api.post('/sync/bulk', { lastSync });

            // Update last sync time
            await setLastSync(response.data.syncTime);
            set({
                lastSync: response.data.syncTime,
                pendingChanges: 0,
                isSyncing: false,
            });

            return response.data;
        } catch (error) {
            console.error('Sync failed:', error);
            set({ isSyncing: false });
        }
    },

    processOfflineQueue: async () => {
        const queue = await getOfflineQueue();

        if (queue.length === 0) return;

        console.log(`Processing ${queue.length} offline operations...`);

        // Process each operation
        for (const operation of queue) {
            try {
                await api({
                    method: operation.method,
                    url: operation.url,
                    data: operation.data,
                });
            } catch (error) {
                console.error('Failed to process offline operation:', error);
            }
        }

        // Clear queue after processing
        await clearOfflineQueue();
    },
}));

export default useSyncStore;
