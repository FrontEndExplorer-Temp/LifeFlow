import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useSkillStore from '../../store/skillStore';
import useThemeStore from '../../store/themeStore';

export default function SkillsListScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const { skills, fetchSkills, isLoading } = useSkillStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSkills();
        setRefreshing(false);
    };

    const themeStyles = {
        container: { backgroundColor: theme.colors.background },
        text: { color: theme.colors.text },
        subText: { color: theme.colors.subText },
        card: { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, themeStyles.card]}
            onPress={() => router.push(`/skills/${item._id}`)}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.skillName, themeStyles.text]}>{item.name}</Text>
                    <Text style={[styles.skillCategory, { color: theme.colors.secondary }]}>{item.category}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.status === 'learning' ? theme.colors.info : theme.colors.success }]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <Text style={[styles.level, themeStyles.subText]}>{item.currentLevel} → {item.targetLevel}</Text>
                <Text style={[styles.streak, { color: theme.colors.warning }]}>🔥 {item.currentStreak} day streak</Text>
            </View>

            {item.roadmap && item.roadmap.length > 0 ? (
                <Text style={[styles.progressText, themeStyles.subText]}>
                    {item.roadmap.filter(i => i.isCompleted).length} / {item.roadmap.length} steps completed
                </Text>
            ) : (
                <Text style={[styles.progressText, { color: theme.colors.danger }]}>No roadmap yet</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Stack.Screen options={{ title: 'My Skills', headerBackTitle: 'Home' }} />

            <FlatList
                data={skills}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, themeStyles.subText]}>No skills added yet.</Text>
                            <Text style={[styles.emptySubText, themeStyles.subText]}>Tap + to start learning something new!</Text>
                        </View>
                    )
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/skills/create')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 20,
        paddingBottom: 100, // Space for FAB
    },
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    skillName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    skillCategory: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    level: {
        fontSize: 14,
    },
    streak: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressText: {
        fontSize: 12,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
    }
});
