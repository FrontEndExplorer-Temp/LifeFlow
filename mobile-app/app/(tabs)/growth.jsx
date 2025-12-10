import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useSkillStore from '../../store/skillStore';
import useHabitStore from '../../store/habitStore';
import useJobStore from '../../store/jobStore';

const { width } = Dimensions.get('window');

export default function GrowthScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const { skills, fetchSkills } = useSkillStore();
    const { habits, fetchHabits } = useHabitStore();
    const { jobs, fetchJobs } = useJobStore();

    useEffect(() => {
        fetchSkills();
        fetchHabits();
        fetchJobs();
    }, []);

    const activeSkills = skills.filter(s => s.status === 'learning' || s.status === 'practicing');
    const activeHabits = habits.filter(h => h.currentStreak > 0);
    const activeJobs = jobs.filter(j => j.status !== 'Rejected' && j.status !== 'Offer');

    const themeStyles = {
        container: { backgroundColor: theme.colors.background },
        text: { color: theme.colors.text },
        subText: { color: theme.colors.subText },
        card: {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: isDarkMode ? 1 : 0, // Add border in dark mode for visibility
            shadowOpacity: isDarkMode ? 0.3 : 0.1, // Stronger shadow in dark mode
        },
        progressBarBg: {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }
    };

    return (
        <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, themeStyles.text]}>Growth Hub</Text>
                    <Text style={[styles.headerSubtitle, themeStyles.subText]}>Level up your life</Text>
                </View>
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/profile')}>
                    <Ionicons name="person-outline" size={20} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* 1. Skills Section (Hero) */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, themeStyles.text]}>My Skills</Text>
                    <TouchableOpacity onPress={() => router.push('/skills')}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Manage All</Text>
                    </TouchableOpacity>
                </View>

                {skills.length === 0 ? (
                    <TouchableOpacity style={[styles.emptyCard, themeStyles.card]} onPress={() => router.push('/skills/create')}>
                        <Ionicons name="add-circle-outline" size={48} color={theme.colors.subText} />
                        <Text style={[styles.emptyText, themeStyles.subText]}>Start learning a new skill</Text>
                    </TouchableOpacity>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {activeSkills.slice(0, 5).map(skill => (
                            <TouchableOpacity
                                key={skill._id}
                                style={[styles.skillCard, themeStyles.card]}
                                onPress={() => router.push(`/skills/${skill._id}`)}
                            >
                                <View style={[styles.skillBadge, { backgroundColor: skill.status === 'learning' ? theme.colors.info + '20' : theme.colors.success + '20' }]}>
                                    <Text style={[styles.skillBadgeText, { color: skill.status === 'learning' ? theme.colors.info : theme.colors.success }]}>{skill.status}</Text>
                                </View>
                                <Text style={[styles.skillName, themeStyles.text]} numberOfLines={1}>{skill.name}</Text>
                                <Text style={[styles.skillLevel, themeStyles.subText]}>Lvl {skill.currentLevel} → {skill.targetLevel}</Text>

                                <View style={[styles.progressBar, themeStyles.progressBarBg]}>
                                    <View style={[styles.progressFill, { width: `${(skill.roadmap?.filter(i => i.isCompleted).length || 0) / (skill.roadmap?.length || 1) * 100}%`, backgroundColor: theme.colors.primary }]} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* 2. Habits & Consistency */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, themeStyles.text]}>Consistency</Text>
                    <TouchableOpacity onPress={() => router.push('/growth/habits')}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>View Habits</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.statCard, themeStyles.card]} onPress={() => router.push('/growth/habits')}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.warning }]}>{activeHabits.length}</Text>
                            <Text style={[styles.statLabel, themeStyles.subText]}>Active Streaks</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.success }]}>{habits.length}</Text>
                            <Text style={[styles.statLabel, themeStyles.subText]}>Total Habits</Text>
                        </View>
                    </View>
                    <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Check-in Today →</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 3. Career / Jobs */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, themeStyles.text]}>Career</Text>
                    <TouchableOpacity onPress={() => router.push('/growth/jobs')}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Manage Jobs</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.jobSummaryCard, themeStyles.card]} onPress={() => router.push('/growth/jobs')}>
                    <View style={styles.jobIcon}>
                        <Ionicons name="briefcase" size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.jobTitle, themeStyles.text]}>Job Hunt Tracker</Text>
                        <Text style={[styles.jobSubtitle, themeStyles.subText]}>{activeJobs.length} active applications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.subText} />
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    iconButton: {
        padding: 10,
        borderRadius: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    horizontalScroll: {
        paddingHorizontal: 20,
        gap: 16,
    },
    skillCard: {
        width: width * 0.6,
        padding: 20, // Standardized padding
        borderRadius: 24, // Standardized radius
        marginRight: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    skillBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 12,
    },
    skillBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    skillName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    skillLevel: {
        fontSize: 14,
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        // backgroundColor removed here, handled by themeStyles
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    emptyCard: {
        marginHorizontal: 20,
        padding: 32,
        borderRadius: 24, // Standardized radius
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    },
    statCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 24,
        elevation: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 40,
    },
    jobSummaryCard: {
        marginHorizontal: 20,
        padding: 24, // Standardized padding
        borderRadius: 24, // Standardized radius
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        elevation: 2,
    },
    jobIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    jobSubtitle: {
        fontSize: 14,
    }
});
