import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useNotificationStore from '../store/notificationStore';
import useThemeStore from '../store/themeStore';

dayjs.extend(relativeTime);

export default function NotificationsScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, clearAllNotifications, isLoading } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handlePress = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
    };

    // Grouping Logic
    const groupedNotifications = notifications.reduce((acc, notification) => {
        const date = dayjs(notification.createdAt);
        const now = dayjs();
        let title = 'Older';

        if (date.isSame(now, 'day')) title = 'Today';
        else if (date.isSame(now.subtract(1, 'day'), 'day')) title = 'Yesterday';
        else if (date.isAfter(now.subtract(7, 'day'))) title = 'Last 7 Days';

        const group = acc.find(g => g.title === title);
        if (group) {
            group.data.push(notification);
        } else {
            acc.push({ title, data: [notification] });
        }
        return acc;
    }, []);

    // Sort order: Today -> Yesterday -> Last 7 Days -> Older
    const sortOrder = { 'Today': 1, 'Yesterday': 2, 'Last 7 Days': 3, 'Older': 4 };
    groupedNotifications.sort((a, b) => sortOrder[a.title] - sortOrder[b.title]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#34C759' };
            case 'warning': return { name: 'warning', color: '#FF9500' };
            case 'error': return { name: 'alert-circle', color: '#FF3B30' };
            default: return { name: 'information-circle', color: '#4A90E2' };
        }
    };

    const renderItem = ({ item }) => {
        const icon = getIcon(item.type);
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.card },
                    item.isRead ? { opacity: 0.7 } : styles.unreadCardBorder
                ]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                        <Text style={[styles.time, { color: theme.colors.subText }]}>
                            {dayjs(item.createdAt).fromNow(true)}
                        </Text>
                    </View>
                    <Text style={[styles.message, { color: theme.colors.subText }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Inbox</Text>

                <View style={styles.headerActions}>
                    {notifications.some(n => !n.isRead) && (
                        <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
                            <Ionicons name="checkmark-done-outline" size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={clearAllNotifications} style={styles.actionButton}>
                            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading && notifications.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <SectionList
                    sections={groupedNotifications}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.subText }]}>{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                    stickySectionHeadersEnabled={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} tintColor={theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconBg, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="mail-open-outline" size={48} color={theme.colors.subText} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All Caught Up!</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.colors.subText }]}>
                                You have no new notifications at the moment.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        flex: 1,
        marginLeft: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        paddingVertical: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.7,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    unreadCardBorder: {
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2', // Primary color assumption, will be overridden by logic if needed, but styling here for structure
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        width: '70%',
        lineHeight: 20,
    },
});
