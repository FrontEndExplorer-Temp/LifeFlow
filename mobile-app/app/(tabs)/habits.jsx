import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useHabitStore from '../../store/habitStore';

const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HabitSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const bg = isDarkMode ? '#333' : '#e0e0e0';

    return (
        <View style={[styles.habitCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff', borderLeftColor: 'transparent' }]}>
            <View style={styles.habitContent}>
                <View style={styles.habitLeft}>
                    <Animated.View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: bg, opacity, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Animated.View style={{ width: '60%', height: 16, borderRadius: 4, backgroundColor: bg, opacity, marginBottom: 6 }} />
                        <Animated.View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: bg, opacity }} />
                    </View>
                </View>
                <Animated.View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: bg, opacity }} />
            </View>
            <View style={styles.weekRow}>
                {[...Array(7)].map((_, i) => (
                    <Animated.View key={i} style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: bg, opacity }} />
                ))}
            </View>
        </View>
    );
};

export default function HabitsScreen() {
    const { habits, fetchHabits, addHabit, deleteHabit, toggleCompletion, updateHabit, isLoading } = useHabitStore();
    const { isDarkMode } = useThemeStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', color: '#007AFF', targetDays: [] });
    const [editingHabitId, setEditingHabitId] = useState(null);

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleAddHabit = async () => {
        if (!formData.name.trim()) return;

        // Determine frequency based on selected target days
        let freq = 'Daily';
        if (formData.targetDays && formData.targetDays.length > 0 && formData.targetDays.length < 7) {
            freq = 'Custom';
        }

        if (editingHabitId) {
            // update
            await updateHabit(editingHabitId, {
                name: formData.name,
                description: formData.description,
                color: formData.color,
                targetDays: formData.targetDays,
                frequency: freq,
            });
        } else {
            await addHabit({
                ...formData,
                frequency: freq,
            });
        }

        setFormData({ name: '', description: '', color: '#007AFF', targetDays: [] });
        setEditingHabitId(null);
        setModalVisible(false);
    };

    const toggleDay = (day) => {
        setFormData((prev) => {
            const exists = prev.targetDays.includes(day);
            const next = exists ? prev.targetDays.filter(d => d !== day) : [...prev.targetDays, day];
            return { ...prev, targetDays: next };
        });
    };

    const isCompletedToday = (habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.completions.some(d =>
            new Date(d).toISOString().split('T')[0] === today
        );
    };

    const formatDateShort = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const handleToggle = async (habit) => {
        const today = new Date();
        const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
        const isTargetToday = (habit.targetDays || []).includes(weekdayShort);

        if (!isTargetToday && habit.targetDays && habit.targetDays.length > 0) {
            // warn before toggling
            Alert.alert(
                'Not a target day',
                'This habit is not scheduled for today. Mark completion anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => toggleCompletion(habit._id, new Date().toISOString()) },
                ]
            );
        } else {
            await toggleCompletion(habit._id, new Date().toISOString());
        }
    };

    const openEditModal = (habit) => {
        setEditingHabitId(habit._id);
        setFormData({
            name: habit.name || '',
            description: habit.description || '',
            color: habit.color || '#007AFF',
            targetDays: habit.targetDays || [],
        });
        setModalVisible(true);
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        header: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' }, // Blends with container
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        card: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        modalContent: { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        input: {
            borderColor: isDarkMode ? '#333' : '#ddd',
            color: isDarkMode ? '#fff' : '#000',
            backgroundColor: isDarkMode ? '#2C2C2E' : '#fff',
        },
        dayChip: {
            active: isDarkMode ? '#4A90E2' : '#007AFF',
            inactive: isDarkMode ? '#333' : '#e0e0e0',
            textActive: '#fff',
            textInactive: isDarkMode ? '#ccc' : '#333',
        }
    };

    const renderHabitItem = ({ item }) => {
        const completed = isCompletedToday(item);
        const weekDates = (() => {
            const today = new Date();
            // get Monday of current week
            const day = today.getDay(); // 0 Sun - 6 Sat
            const diffToMonday = (day + 6) % 7; // days since Monday
            const monday = new Date(today);
            monday.setDate(today.getDate() - diffToMonday);
            monday.setHours(0, 0, 0, 0);
            const arr = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                arr.push(d);
            }
            return arr;
        })();

        const norm = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };

        return (
            <View style={[styles.habitCard, themeStyles.card, { borderLeftColor: item.color }]}>
                <TouchableOpacity
                    style={styles.habitContent}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.habitLeft}>
                        <View style={[
                            styles.checkbox,
                            { borderColor: item.color },
                            completed && { backgroundColor: item.color }
                        ]}>
                            {completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <View style={styles.habitInfo}>
                            <Text style={[styles.habitName, themeStyles.text, completed && styles.habitNameCompleted]}>
                                {item.name}
                            </Text>
                            {item.description ? (
                                <Text style={[styles.habitDescription, themeStyles.subText]} numberOfLines={1}>{item.description}</Text>
                            ) : null}
                            {item.targetDays && item.targetDays.length > 0 && (
                                <Text style={[styles.habitTargetDays, themeStyles.subText]}>
                                    {item.targetDays.join(', ')}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.habitRight}>
                        <View style={[styles.streakBadge, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                            <Text style={styles.streakLabel}>🔥</Text>
                            <Text style={[styles.streakNumber, themeStyles.text]}>{item.currentStreak}</Text>
                        </View>

                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEditModal(item); }} style={styles.iconButton}>
                            <Ionicons name="pencil" size={18} color={themeStyles.subText.color} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                Alert.alert('Delete Habit', 'Are you sure?', [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(item._id) }
                                ]);
                            }}
                            style={styles.iconButton}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* Weekly mini-calendar */}
                <View style={styles.weekRow}>
                    {weekDates.map((d) => {
                        const weekdayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                        const isTarget = (item.targetDays || []).includes(weekdayKey);
                        const isCompleted = (item.completions || []).some(c => norm(c) === norm(d));
                        const isToday = norm(d) === norm(new Date());

                        return (
                            <View key={d.toISOString()} style={styles.dayColumn}>
                                <Text style={[styles.dayLabel, themeStyles.subText, isToday && { color: item.color, fontWeight: 'bold' }]}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][(d.getDay() + 6) % 7]}
                                </Text>
                                <View style={[
                                    styles.dayCell,
                                    { borderColor: isDarkMode ? '#333' : '#eee' },
                                    isTarget && { borderColor: item.color },
                                    isCompleted && { backgroundColor: item.color, borderColor: item.color }
                                ]}>
                                    {isCompleted && <Ionicons name="checkmark" size={10} color="#fff" />}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Header Stats */}
            <View style={[styles.header, themeStyles.header]}>
                <View>
                    <Text style={[styles.headerTitle, themeStyles.text]}>Habits</Text>
                    <Text style={[styles.headerSubtitle, themeStyles.subText]}>
                        {habits.filter(h => isCompletedToday(h)).length} of {habits.length} completed today
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#007AFF' }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Habits List */}
            {isLoading && habits.length === 0 ? (
                <View style={styles.listContent}>
                    <HabitSkeleton />
                    <HabitSkeleton />
                    <HabitSkeleton />
                </View>
            ) : (
                <FlatList
                    data={habits}
                    renderItem={renderHabitItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="leaf-outline" size={48} color={themeStyles.subText.color} />
                            <Text style={[styles.emptyText, themeStyles.subText]}>No habits yet. Start building a better you!</Text>
                        </View>
                    }
                />
            )}

            {/* Add/Edit Habit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, themeStyles.text]}>{editingHabitId ? 'Edit Habit' : 'New Habit'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={themeStyles.subText.color} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, themeStyles.text]}>Habit Name</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="e.g., Morning Exercise"
                            placeholderTextColor={isDarkMode ? '#666' : '#999'}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <Text style={[styles.label, themeStyles.text]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Add details"
                            placeholderTextColor={isDarkMode ? '#666' : '#999'}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />

                        <Text style={[styles.label, themeStyles.text]}>Color</Text>
                        <View style={styles.colorPicker}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        formData.color === color && styles.selectedColor
                                    ]}
                                    onPress={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </View>

                        <Text style={[styles.label, themeStyles.text]}>Target Days (Optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {WEEK_DAYS.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    style={[
                                        styles.dayChip,
                                        { backgroundColor: formData.targetDays.includes(d) ? themeStyles.dayChip.active : themeStyles.dayChip.inactive }
                                    ]}
                                    onPress={() => toggleDay(d)}
                                >
                                    <Text style={[
                                        styles.dayChipText,
                                        { color: formData.targetDays.includes(d) ? themeStyles.dayChip.textActive : themeStyles.dayChip.textInactive }
                                    ]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: isDarkMode ? '#4A90E2' : '#007AFF' }]} onPress={handleAddHabit}>
                            <Text style={styles.buttonText}>{editingHabitId ? 'Update Habit' : 'Create Habit'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 60, // Status bar spacing
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    habitCard: {
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    habitContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    habitLeft: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    habitInfo: {
        flex: 1,
    },
    habitName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    habitNameCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    habitDescription: {
        fontSize: 13,
        marginBottom: 4,
    },
    habitTargetDays: {
        fontSize: 11,
        opacity: 0.7,
        fontWeight: '500',
    },
    habitRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    streakLabel: {
        fontSize: 12,
    },
    streakNumber: {
        fontSize: 13,
        fontWeight: '700',
    },
    iconButton: {
        padding: 4,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    dayColumn: {
        alignItems: 'center',
        gap: 6,
    },
    dayLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    dayCell: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    colorPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: '#333',
        borderWidth: 3,
        transform: [{ scale: 1.1 }],
    },
    dayChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
