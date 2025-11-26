import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { lightTheme, darkTheme } from '../constants/theme';

const useThemeStore = create(
    persist(
        (set, get) => ({
            isDarkMode: false,
            theme: lightTheme, // Default
            toggleTheme: () => {
                const newMode = !get().isDarkMode;
                set({
                    isDarkMode: newMode,
                    theme: newMode ? darkTheme : lightTheme
                });
            },
            setTheme: (isDark) => set({
                isDarkMode: isDark,
                theme: isDark ? darkTheme : lightTheme
            }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                // Ensure theme object matches isDarkMode after rehydration
                if (state) {
                    state.theme = state.isDarkMode ? darkTheme : lightTheme;
                }
            }
        }
    )
);

export default useThemeStore;
