import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import useThemeStore from '../store/themeStore';

const BADGES_DATA = [
    { id: 'FIRST_STEP', name: 'First Step', description: 'Complete your first task', icon: '👣' },
    { id: 'TASK_SLAYER', name: 'Task Slayer', description: 'Complete 50 tasks', icon: '⚔️' },
    { id: 'EARLY_BIRD', name: 'Early Bird', description: 'Complete a task before 8 AM', icon: '🌅' },
    { id: 'NIGHT_OWL', name: 'Night Owl', description: 'Complete a task after 10 PM', icon: '🦉' },
    { id: 'WEEKEND_WARRIOR', name: 'Weekend Warrior', description: 'Complete a task on Saturday or Sunday', icon: '🛡️' },
    { id: 'HABIT_STARTER', name: 'Habit Starter', description: 'Maintain a 3-day habit streak', icon: '🌱' },
    { id: 'STREAK_MASTER', name: 'Streak Master', description: 'Maintain a 7-day habit streak', icon: '🔥' },
    { id: 'HABIT_HERO', name: 'Habit Hero', description: 'Maintain a 30-day habit streak', icon: '🦸' },
    { id: 'NOTE_TAKER', name: 'Note Taker', description: 'Create 10 notes', icon: '📝' },
    { id: 'JOB_HUNTER', name: 'Job Hunter', description: 'Apply to 5 jobs', icon: '💼' },
    { id: 'FOCUS_MASTER', name: 'Focus Master', description: 'Accumulate 10 hours of focus time', icon: '🧘' },
    { id: 'MONEY_MANAGER', name: 'Money Manager', description: 'Add 10 transactions', icon: '💰' },
];

const Badges = ({ userBadges = [] }) => {
    const { theme } = useThemeStore();
    const [selectedBadge, setSelectedBadge] = useState(null);

    const unlockedIds = userBadges.map(b => b.id);

    const renderBadge = ({ item }) => {
        const isUnlocked = unlockedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.badgeItem,
                    { backgroundColor: isUnlocked ? theme.colors.card : theme.colors.background, opacity: isUnlocked ? 1 : 0.5 }
                ]}
                onPress={() => setSelectedBadge({ ...item, isUnlocked })}
            >
                <Text style={styles.badgeIcon}>{item.icon}</Text>
                <Text style={[styles.badgeName, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                {isUnlocked && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Achievements</Text>
            <FlatList
                data={BADGES_DATA}
                renderItem={renderBadge}
                keyExtractor={item => item.id}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.row}
            />

            <Modal
                visible={!!selectedBadge}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedBadge(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <Text style={styles.modalIcon}>{selectedBadge?.icon}</Text>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {selectedBadge?.name}
                        </Text>
                        <Text style={[styles.modalDescription, { color: theme.colors.subText }]}>
                            {selectedBadge?.description}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: selectedBadge?.isUnlocked ? theme.colors.success : theme.colors.border }
                        ]}>
                            <Text style={styles.statusText}>
                                {selectedBadge?.isUnlocked ? 'Unlocked' : 'Locked'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => setSelectedBadge(null)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    badgeItem: {
        width: '31%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    badgeIcon: {
        fontSize: 32,
        marginBottom: 5,
    },
    badgeName: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkMark: {
        position: 'absolute',
        top: 5,
        right: 5,
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
    },
    modalIcon: {
        fontSize: 60,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 20,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeButton: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Badges;
