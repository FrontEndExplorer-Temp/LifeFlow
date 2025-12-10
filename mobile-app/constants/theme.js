export const COLORS = {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#5AC8FA',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#8E8E93',
    lightGray: '#E5E5EA',
    darkGray: '#1C1C1E',
};

export const lightTheme = {
    dark: false,
    colors: {
        background: '#F2F2F7',
        card: '#FFFFFF',
        text: '#000000',
        subText: '#666666',
        border: '#E5E5EA',
        notification: '#FF3B30',
        primary: COLORS.primary,
        secondary: COLORS.secondary, // Added missing secondary
        info: COLORS.info, // Added missing info
        success: COLORS.success,
        warning: COLORS.warning,
        danger: COLORS.danger,
        tabBar: '#FFFFFF',
        header: '#FFFFFF',
        input: '#FFFFFF',
        inputBorder: '#E5E5EA',
        chip: '#F0F0F0',
        chipText: '#666666',
    },
};

export const darkTheme = {
    dark: true,
    colors: {
        background: '#000000', // Deep black for better OLED saving/contrast
        card: '#1C1C1E', // Slightly lighter dark for cards
        text: '#FFFFFF',
        subText: '#98989F',
        border: '#2C2C2E',
        notification: '#FF453A',
        primary: '#0A84FF',
        secondary: '#5E5CE6', // Lighter purple for dark mode
        info: '#64D2FF', // Lighter blue for dark mode
        success: '#32D74B', // Lighter green
        warning: '#FF9F0A',
        danger: '#FF453A',
        tabBar: '#1C1C1E',
        header: '#1C1C1E',
        input: '#1C1C1E',
        inputBorder: '#38383A',
        chip: '#2C2C2E',
        chipText: '#FFFFFF',
    },
};
