import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useTimerStore from '../../store/timerStore';
import useAuthStore from '../../store/authStore';
import useSummaryStore from '../../store/summaryStore';
import useTaskStore from '../../store/taskStore';
import useThemeStore from '../../store/themeStore';
import useSkillStore from '../../store/skillStore';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { theme, isDarkMode } = useThemeStore();
    const {
        activeTimer,
        dailyStats,
        elapsedTime,
        isLoading,
        syncActiveTimer,
        syncDailyStats,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer
    } = useTimerStore();
    const { todaySummary, fetchTodaySummary, isLoading: summaryLoading } = useSummaryStore();
    const { tasks, fetchTasks, updateTask } = useTaskStore();
    const { generateDailyPlan, isLoading: skillLoading } = useSkillStore();
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        syncActiveTimer();
        syncDailyStats();
        fetchTodaySummary();
        fetchTasks(); // Fetch tasks on mount
    }, []);

    // Refresh stats when timer stops
    useEffect(() => {
        if (!activeTimer) {
            syncDailyStats();
            fetchTodaySummary();
        }
    }, [activeTimer]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            syncActiveTimer(),
            syncDailyStats(),
            fetchTodaySummary()
        ]);
        setRefreshing(false);
    };

    // Refresh today's summary when tasks or timer change
    useEffect(() => {
        fetchTodaySummary();
    }, [tasks, activeTimer]);

    const generatePlan = async (mode) => {
        try {
            await generateDailyPlan({ minutesAvailable: 90, mode });
            await fetchTasks();
        } catch (error) {
            alert("Failed to generate plan: " + error.message);
        }
    };

    const handleGeneratePlan = async () => {
        const hasExistingPlan = tasks.some(t => t.status === 'Today' && (t.taskType === 'learning' || t.taskType === 'practice'));

        if (hasExistingPlan) {
            if (Platform.OS === 'web') {
                const replace = window.confirm("You already have a plan for today. Click OK to REPLACE it with a new one.");
                if (replace) {
                    generatePlan('replace');
                }
                return;
            }

            Alert.alert(
                "Plan Already Exists",
                "Do you want to replace your existing plan or add to it?",
                [
                    { text: "Append", onPress: () => generatePlan('append') },
                    { text: "Replace", onPress: () => generatePlan('replace'), style: 'destructive' },
                    { text: "Cancel", style: "cancel" }
                ]
            );
            return;
        }

        generatePlan('append');
    };

    const handleStartTask = (task) => {
        if (activeTimer) {
            Alert.alert("Timer Running", "Please stop the current timer first.");
            return;
        }
        startTimer(task.title, [task.taskType || 'general']);
    };

    const handleCompleteTask = async (task) => {
        await updateTask(task._id, { status: 'Completed' });
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const themeStyles = {
        container: {
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
        card: {
            backgroundColor: theme.colors.card,
            shadowColor: isDarkMode ? '#000' : '#888',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.colors.border,
        },
        timerDisplay: {
            color: theme.colors.text,
        },
        summaryItem: {
            backgroundColor: isDarkMode ? theme.colors.input : '#f8f9fa',
        },
        taskCard: {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: isDarkMode ? 1 : 0,
            shadowColor: isDarkMode ? '#000' : '#888',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            elevation: isDarkMode ? 0 : 2, // Reduce elevation in dark mode to rely on border
        }
    };

    const TaskActionCard = ({ task, icon, color }) => (
        <View style={[styles.taskActionCard, themeStyles.taskCard]}>
            <View style={styles.taskHeader}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    {task.skillId && (
                        <Text style={[styles.skillTag, { color: color }]}>
                            {task.skillId.name ? task.skillId.name.toUpperCase() : 'SKILL'}
                        </Text>
                    )}
                    <Text style={[styles.taskTitleCard, themeStyles.text]} numberOfLines={2}>{task.title}</Text>
                    <Text style={[styles.taskMeta, themeStyles.subText]}>Est. {task.estimatedMinutes} mins</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.cardBtn, { backgroundColor: color + '15' }]}
                    onPress={() => handleStartTask(task)}
                >
                    <Ionicons name="play" size={16} color={color} />
                    <Text style={[styles.cardBtnText, { color: color }]}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.cardBtn, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                    onPress={() => handleCompleteTask(task)}
                >
                    <Ionicons name="checkmark" size={16} color={theme.colors.subText} />
                    <Text style={[styles.cardBtnText, { color: theme.colors.subText }]}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 5) return 'Late Night Hustle? 🌙';
        if (h < 12) return 'Good Morning, ☀️';
        if (h < 17) return 'Good Afternoon, 🌤️';
        return 'Good Evening, 🌙';
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.container, themeStyles.container]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greetingSub, themeStyles.subText]}>{getGreeting()}</Text>
                    <Text style={[styles.greeting, themeStyles.text]}>{user?.name}</Text>
                </View>
                {/* Placeholder for potential profile image or settings icon */}
            </View>

            {activeTimer && (
                <View style={[styles.statusBadge, { backgroundColor: activeTimer.status === 'running' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                    <Text style={{ color: activeTimer.status === 'running' ? theme.colors.success : theme.colors.warning, fontWeight: '600' }}>
                        {activeTimer.status === 'running' ? '● Running' : '● Paused'} {activeTimer.description || ''}
                    </Text>
                </View>
            )}

            <View style={[styles.timerCard, themeStyles.card]}>
                <Text style={[styles.timerTitle, themeStyles.subText]}>
                    {activeTimer ? (activeTimer.description || 'Focus Session') : 'Ready to Focus?'}
                </Text>

                <Text style={[styles.timerDisplay, themeStyles.timerDisplay]}>{formatTime(elapsedTime)}</Text>

                <View style={styles.controls}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    ) : !activeTimer ? (
                        <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.colors.primary }]} onPress={() => startTimer('Focus Session', [])}>
                            <Text style={styles.buttonText}>Start Focus</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            {activeTimer.status === 'running' ? (
                                <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.warning }]} onPress={pauseTimer}>
                                    <Text style={styles.buttonText}>Pause</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.success }]} onPress={resumeTimer}>
                                    <Text style={styles.buttonText}>Resume</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.danger }]} onPress={stopTimer}>
                                <Text style={styles.buttonText}>Stop</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* AI Plan Generator */}
            <View style={{ marginBottom: 24 }}>
                <TouchableOpacity
                    style={[styles.planButton, { backgroundColor: theme.colors.secondary }]}
                    onPress={handleGeneratePlan}
                    disabled={skillLoading}
                >
                    {skillLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>✨ Generate Today's Plan</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Learning & Practice Sections */}
            {tasks.filter(t => t.taskType === 'learning' && t.status === 'Today').length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, themeStyles.text]}>📚 Learning Tasks</Text>
                    {tasks.filter(t => t.taskType === 'learning' && t.status === 'Today').map(task => (
                        <TaskActionCard key={task._id} task={task} icon="book" color={theme.colors.primary} />
                    ))}
                </View>
            )}

            {tasks.filter(t => t.taskType === 'practice' && t.status === 'Today').length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, themeStyles.text]}>⚡ Practice Tasks</Text>
                    {tasks.filter(t => t.taskType === 'practice' && t.status === 'Today').map(task => (
                        <TaskActionCard key={task._id} task={task} icon="flash" color={theme.colors.secondary} />
                    ))}
                </View>
            )}

            {/* Today's Progress Summary */}
            <View style={[styles.summaryCard, themeStyles.card]}>
                <Text style={[styles.summaryTitle, themeStyles.text]}>Today's Summary</Text>
                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                            {todaySummary?.completedTasksCount ?? 0}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Tasks Done</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                            {formatDuration(todaySummary.totalWorkSeconds || 0)}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Work Time</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                            {formatDuration(todaySummary.totalBreakSeconds || 0)}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Break Time</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                            {todaySummary.productivityScore || 0}%
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Productivity</Text>
                    </View>
                </View>
                <Text style={[styles.summaryHint, themeStyles.subText]}>
                    Last updated: {todaySummary.updatedAt ? new Date(todaySummary.updatedAt).toLocaleTimeString() : 'Just now'}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60, // Added top padding for status bar
    },
    header: {
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greetingSub: {
        fontSize: 14,
        marginBottom: 4,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    statusBadge: {
        alignSelf: 'center', // Centered as requested
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 4, // Align title with content
    },
    taskActionCard: {
        borderRadius: 24, // Standardized radius
        padding: 20, // Standardized padding
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skillTag: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    taskTitleCard: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    taskMeta: {
        fontSize: 12,
        marginTop: 4,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 8,
    },
    cardBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryCard: {
        padding: 24, // Standardized padding
        borderRadius: 24, // Standardized radius
        marginBottom: 32,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    summaryItem: {
        width: isSmallScreen ? '47%' : '48%',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    summaryHint: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 16,
        fontStyle: 'italic',
        opacity: 0.6,
    },
    timerCard: {
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24, // Added spacing for new position
    },
    timerTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timerDisplay: {
        fontSize: 56,
        fontWeight: 'bold',
        marginBottom: 32,
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    startButton: {
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
    },
    controlButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    planButton: {
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
