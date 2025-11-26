// AI Assistant Screen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import useAiStore from '../../store/aiStore';
import useThemeStore from '../../store/themeStore';

export default function AiScreen() {
    const { isDarkMode } = useThemeStore();
    const {
        dailyPlan,
        taskSuggestions,
        habitInsights,
        isGenerating,
        error,
        generateDailyPlan,
        getTaskSuggestions,
        getHabitInsights,
        reset,
    } = useAiStore();

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' },
        text: { color: isDarkMode ? '#fff' : '#333' },
        subText: { color: isDarkMode ? '#aaa' : '#666' },
        button: { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff', padding: 12, borderRadius: 8, marginVertical: 6 },
        buttonText: { color: isDarkMode ? '#fff' : '#007AFF', fontWeight: '600' },
    };

    const renderSection = (title, content) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, themeStyles.text]}>{title}</Text>
            <Text style={[styles.sectionContent, themeStyles.subText]}>{content || '—'}</Text>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
            <Text style={[styles.header, themeStyles.text]}>AI Assistant</Text>

            <TouchableOpacity style={themeStyles.button} onPress={generateDailyPlan} disabled={isGenerating}>
                <Text style={themeStyles.buttonText}>Generate Daily Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themeStyles.button} onPress={getTaskSuggestions} disabled={isGenerating}>
                <Text style={themeStyles.buttonText}>Get Task Suggestions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themeStyles.button} onPress={getHabitInsights} disabled={isGenerating}>
                <Text style={themeStyles.buttonText}>Get Habit Insights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={themeStyles.button} onPress={reset}>
                <Text style={themeStyles.buttonText}>Reset</Text>
            </TouchableOpacity>

            {isGenerating && <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 10 }} />}
            {error && <Text style={[styles.error, themeStyles.subText]}>Error: {error}</Text>}

            {renderSection('Daily Plan', typeof dailyPlan === 'object' ? JSON.stringify(dailyPlan, null, 2) : dailyPlan)}
            {renderSection('Task Suggestions', taskSuggestions.length ? JSON.stringify(taskSuggestions, null, 2) : '')}
            {renderSection('Habit Insights', habitInsights.length ? JSON.stringify(habitInsights, null, 2) : '')}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '600' },
    sectionContent: { fontSize: 14, marginTop: 4 },
    error: { color: '#FF3B30', marginVertical: 8 },
});
