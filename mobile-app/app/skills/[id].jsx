import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import useSkillStore from '../../store/skillStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function SkillDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const { skills, generateRoadmap, generateDailyPractice, toggleRoadmapItem, isLoading } = useSkillStore();

    // Find skill from store or fetch
    const skill = skills.find(s => s._id === id) || {};

    const [generating, setGenerating] = useState(false);

    const handleGenerateRoadmap = async () => {
        setGenerating(true);
        try {
            await generateRoadmap(id);
            Alert.alert('Success', 'Roadmap generated successfully!');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to generate roadmap');
        } finally {
            setGenerating(false);
        }
    };

    const handleGeneratePractice = async () => {
        setGenerating(true);
        try {
            await generateDailyPractice({ maxTasks: 3, minutesAvailable: 30 });
            Alert.alert('Success', 'Practice tasks added to multiple skills (including this one if applicable)!');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to generate practice');
        } finally {
            setGenerating(false);
        }
    };

    const themeStyles = {
        container: { backgroundColor: theme.colors.background },
        text: { color: theme.colors.text },
        subText: { color: theme.colors.subText },
        card: { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
    };

    if (!skill.name && !isLoading) {
        return (
            <View style={[styles.container, themeStyles.container, styles.center]}>
                <Text style={themeStyles.text}>Skill not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, themeStyles.container]}>
            <Stack.Screen options={{ title: skill.name || 'Skill Detail', headerBackTitle: 'Back' }} />

            <View style={styles.header}>
                <Text style={[styles.title, themeStyles.text]}>{skill.name}</Text>
                <Text style={[styles.level, { color: theme.colors.primary }]}>{skill.currentLevel} → {skill.targetLevel}</Text>
                <View style={[styles.badge, { backgroundColor: skill.status === 'learning' ? theme.colors.info : theme.colors.success }]}>
                    <Text style={styles.badgeText}>{skill.status}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {(!skill.roadmap || skill.roadmap.length === 0) && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={handleGenerateRoadmap}
                        disabled={generating}
                    >
                        {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Roadmap</Text>}
                    </TouchableOpacity>
                )}

                {skill.status === 'practicing' && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.secondary, marginTop: 10 }]}
                        onPress={handleGeneratePractice}
                        disabled={generating}
                    >
                        <Text style={styles.buttonText}>Generate Practice Tasks</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Roadmap */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, themeStyles.text]}>Roadmap</Text>

                {skill.roadmap && skill.roadmap.length > 0 ? (
                    skill.roadmap.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.roadmapItem, themeStyles.card, item.isCompleted && styles.completedItem]}
                            onPress={() => {
                                toggleRoadmapItem(skill._id, index);
                            }}
                        >
                            <View style={styles.roadmapHeader}>
                                <Text style={[styles.phaseName, { color: theme.colors.secondary }]}>{item.phaseName}</Text>
                                {item.isCompleted ? (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                                ) : (
                                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border }} />
                                )}
                            </View>
                            <Text style={[styles.roadmapTitle, themeStyles.text, item.isCompleted && styles.completedText]}>{item.title}</Text>
                            <Text style={[styles.roadmapDesc, themeStyles.subText]}>{item.description}</Text>
                            <Text style={[styles.roadmapMeta, themeStyles.subText]}>{item.estimatedMinutes} mins</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={[styles.emptyText, themeStyles.subText]}>No roadmap generated yet.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    level: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    actions: {
        marginBottom: 24,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    roadmapItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    completedItem: {
        opacity: 0.7,
    },
    roadmapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    phaseName: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    roadmapTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    completedText: {
        textDecorationLine: 'line-through',
    },
    roadmapDesc: {
        fontSize: 14,
        marginBottom: 8,
    },
    roadmapMeta: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 20,
    }
});
