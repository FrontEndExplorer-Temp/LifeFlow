import { create } from 'zustand';
import api from '../services/api';
import useNotificationStore from './notificationStore';
import useAuthStore from './authStore';

const useTimerStore = create((set, get) => ({
    activeTimer: null,
    dailyStats: { totalWorkSeconds: 0, totalBreakSeconds: 0, productivityScore: 0 },
    isLoading: false,
    error: null,
    elapsedTime: 0, // in seconds
    intervalId: null,
    breakNotificationId: null,

    syncDailyStats: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
            const response = await api.get('/summary/today');
            set({ dailyStats: response.data });
        } catch (error) {
            console.error('Failed to fetch daily stats', error);
        }
    },

    syncActiveTimer: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });
        try {
            const response = await api.get('/timers/active');
            const timer = response.data;

            if (timer) {
                // Calculate elapsed time based on start time and pauses
                const now = new Date();
                const startTime = new Date(timer.startTime);
                let totalPauseTime = 0;

                timer.pauses.forEach(pause => {
                    const start = new Date(pause.start);
                    const end = pause.end ? new Date(pause.end) : now;
                    totalPauseTime += (end - start);
                });

                let elapsed = 0;
                if (timer.status === 'running') {
                    elapsed = Math.floor((now - startTime - totalPauseTime) / 1000);
                } else if (timer.status === 'paused') {
                    const lastPause = timer.pauses[timer.pauses.length - 1];
                    const pauseStart = new Date(lastPause.start);

                    let previousPausesDuration = 0;
                    for (let i = 0; i < timer.pauses.length - 1; i++) {
                        const p = timer.pauses[i];
                        previousPausesDuration += (new Date(p.end) - new Date(p.start));
                    }

                    elapsed = Math.floor((pauseStart - startTime - previousPausesDuration) / 1000);
                }

                set({ activeTimer: timer, elapsedTime: elapsed, isLoading: false });

                if (timer.status === 'running') {
                    get().startTicker();
                    // Reschedule break reminder if needed (logic could be more complex here to account for elapsed time)
                }
            } else {
                set({ activeTimer: null, elapsedTime: 0, isLoading: false });
                get().stopTicker();
            }
        } catch (error) {
            console.error('Failed to sync timer', error);
            set({ isLoading: false });
        }
    },

    startTimer: async (description, tags) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/timers/start', { description, tags });
            set({ activeTimer: response.data, elapsedTime: 0, isLoading: false });
            get().startTicker();

            // Schedule break reminder
            const { breakReminders, breakReminderInterval, scheduleSmartNotification } = useNotificationStore.getState();
            if (breakReminders) {
                const notificationId = await scheduleSmartNotification('break-reminder', { minutes: breakReminderInterval });
                set({ breakNotificationId: notificationId });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    stopTimer: async () => {
        set({ isLoading: true });
        try {
            await api.post('/timers/stop');
            set({ activeTimer: null, elapsedTime: 0, isLoading: false });
            get().stopTicker();
            get().syncDailyStats(); // Refresh stats

            // Cancel break reminder
            const { breakNotificationId } = get();
            if (breakNotificationId) {
                useNotificationStore.getState().cancelNotification(breakNotificationId);
                set({ breakNotificationId: null });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    pauseTimer: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post('/timers/pause');
            set({ activeTimer: response.data, isLoading: false });
            get().stopTicker();

            // Cancel break reminder
            const { breakNotificationId } = get();
            if (breakNotificationId) {
                useNotificationStore.getState().cancelNotification(breakNotificationId);
                set({ breakNotificationId: null });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    resumeTimer: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post('/timers/resume');
            set({ activeTimer: response.data, isLoading: false });
            // We need to re-sync to get the correct elapsed time base
            await get().syncActiveTimer();

            // Reschedule break reminder
            const { breakReminders, breakReminderInterval, scheduleSmartNotification } = useNotificationStore.getState();
            if (breakReminders) {
                // Ideally we should subtract elapsed time, but for simplicity we restart the interval
                // A better implementation would calculate remaining time
                const notificationId = await scheduleSmartNotification('break-reminder', { minutes: breakReminderInterval });
                set({ breakNotificationId: notificationId });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    startTicker: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);

        const id = setInterval(() => {
            set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
        }, 1000);
        set({ intervalId: id });
    },

    stopTicker: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({ intervalId: null });
    },
}));

export default useTimerStore;
