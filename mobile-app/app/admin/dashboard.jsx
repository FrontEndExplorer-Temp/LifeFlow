import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, RefreshControl, Switch, StyleSheet, FlatList, Modal, ActivityIndicator, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAdminStore from '../../store/adminStore';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';

export default function AdminDashboard() {
    const router = useRouter();
    const { users, fetchUsers, deleteUser, toggleBan, updateRole, isLoading, stats, fetchStats, broadcastNotification, logs, fetchLogs } = useAdminStore();
    const { isDarkMode } = useThemeStore();

    // UI State
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs'
    const [modalVisible, setModalVisible] = useState(false);
    const [banModalVisible, setBanModalVisible] = useState(false);

    // Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // Ban State
    const [selectedUser, setSelectedUser] = useState(null);
    const [banDuration, setBanDuration] = useState(null); // null = permanent

    // Local Component State for Settings
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [globalKey, setGlobalKey] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchStats();
        fetchLogs();
        fetchSettings(); // Initial fetch
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setIsMaintenanceMode(res.data.isMaintenanceMode);
            // Don't set globalKey to state for security/masking (it returns hasGlobalKey boolean usually)
        } catch (error) {
            console.error(error);
        }
    };

    const toggleMaintenance = async () => {
        const message = isMaintenanceMode
            ? "Are you sure you want to disable Maintenance Mode? Users will be able to log in again."
            : "Are you sure you want to ENABLE Maintenance Mode? All non-admin users will be locked out immediately.";

        if (Platform.OS === 'web') {
            if (window.confirm(message)) {
                try {
                    const res = await api.put('/admin/maintenance');
                    setIsMaintenanceMode(res.data.isMaintenanceMode);
                    // Alert.alert works for simple messages on web usually
                    Alert.alert("Success", res.data.message);
                } catch (error) {
                    Alert.alert("Error", "Failed to toggle maintenance mode");
                }
            }
        } else {
            Alert.alert(
                "Maintenance Mode",
                message,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: isMaintenanceMode ? "Disable" : "Enable Lockdown",
                        style: isMaintenanceMode ? "default" : "destructive",
                        onPress: async () => {
                            try {
                                const res = await api.put('/admin/maintenance');
                                setIsMaintenanceMode(res.data.isMaintenanceMode);
                                Alert.alert("Success", res.data.message);
                            } catch (error) {
                                Alert.alert("Error", "Failed to toggle maintenance mode");
                            }
                        }
                    }
                ]
            );
        }
    };

    const saveGlobalKey = async () => {
        if (!globalKey) return;
        try {
            await api.put('/admin/ai-key', { key: globalKey });
            Alert.alert("Success", "Global AI Key updated successfully");
            setGlobalKey(''); // Clear input for security
        } catch (error) {
            Alert.alert("Error", "Failed to update Global Key");
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteUser(id) }
            ]
        );
    };

    const handleRoleUpdate = (id, isAdmin) => {
        if (Platform.OS === 'web') {
            const confirm = window.confirm(`Are you sure you want to ${isAdmin ? 'remove Admin rights from' : 'promote to Admin'} this user?`);
            if (confirm) {
                updateRole(id);
            }
        } else {
            Alert.alert(
                "Update Role",
                `Are you sure you want to ${isAdmin ? 'remove Admin rights from' : 'promote to Admin'} this user?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Confirm", style: "default", onPress: () => {
                            updateRole(id);
                        }
                    }
                ]
            );
        }
    };

    const openBanModal = (user) => {
        setSelectedUser(user);
        setBanDuration(null);
        setBanModalVisible(true);
    };

    const handleBanSubmit = async () => {
        if (selectedUser) {
            const success = await toggleBan(selectedUser._id, banDuration);
            if (success) setBanModalVisible(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const success = await broadcastNotification(broadcastTitle, broadcastMessage);
        if (success) {
            setModalVisible(false);
            setBroadcastTitle('');
            setBroadcastMessage('');
        }
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' },
        text: { color: isDarkMode ? '#fff' : '#333' },
        subText: { color: isDarkMode ? '#aaa' : '#666' },
        card: { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        input: { backgroundColor: isDarkMode ? '#2C2C2C' : '#f0f0f0', color: isDarkMode ? '#fff' : '#333' }
    };

    const renderStatCard = (title, value, icon, color) => (
        <View style={[styles.statCard, themeStyles.card]}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={[styles.statValue, themeStyles.text]}>{value || 0}</Text>
                <Text style={[styles.statLabel, themeStyles.subText]}>{title}</Text>
            </View>
        </View>
    );

    const renderLogItem = ({ item }) => (
        <View style={[styles.logCard, themeStyles.card]}>
            <View style={styles.logHeader}>
                <Text style={[styles.logAction, themeStyles.text]}>{item.action.replace(/_/g, ' ')}</Text>
                <Text style={[styles.logTime, themeStyles.subText]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.logDetails, themeStyles.subText]}>
                Admin: {item.admin?.name || 'Unknown'} • Target: {item.target?.name || 'N/A'}
            </Text>
            {item.details && (
                <Text style={[styles.logMeta, { color: isDarkMode ? '#888' : '#666' }]}>
                    {JSON.stringify(item.details)}
                </Text>
            )}
        </View>
    );

    const renderUserItem = ({ item }) => (
        <View style={[styles.userCard, themeStyles.card]}>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, themeStyles.text]}>{item.name}</Text>
                <Text style={[styles.userEmail, themeStyles.subText]}>{item.email}</Text>
                <View style={styles.badges}>
                    {item.isAdmin && <View style={styles.adminBadge}><Text style={styles.badgeText}>Admin</Text></View>}
                    {item.isVerified && <View style={styles.verifiedBadge}><Text style={styles.badgeText}>Verified</Text></View>}
                    {item.isBanned && <View style={styles.bannedBadge}><Text style={styles.badgeText}>Banned</Text></View>}
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleRoleUpdate(item._id, item.isAdmin)} style={styles.iconButton}>
                    <Ionicons name={item.isAdmin ? "shield-checkmark" : "shield-outline"} size={20} color="#007AFF" />
                </TouchableOpacity>
                {!item.isAdmin && (
                    <>
                        <TouchableOpacity onPress={() => openBanModal(item)} style={styles.iconButton}>
                            <Ionicons name={item.isBanned ? "checkmark-circle" : "ban"} size={20} color={item.isBanned ? "#34C759" : "#FF9500"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            {/* Stats Section */}
            {stats && (
                <View style={styles.statsGrid}>
                    {renderStatCard('Total Users', stats.totalUsers, 'people', '#007AFF')}
                    {renderStatCard('Total Tasks', stats.totalTasks, 'checkbox', '#34C759')}
                    {renderStatCard('Habits', stats.totalHabits, 'calendar', '#AF52DE')}
                    {renderStatCard('New (30d)', stats.newUsers, 'add-circle', '#FF9500')}
                </View>
            )}

            {/* Actions Section */}
            <TouchableOpacity
                style={[styles.broadcastButton, { backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF' }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="megaphone" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.broadcastButtonText}>Broadcast Message</Text>
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText, themeStyles.text]}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
                    onPress={() => setActiveTab('logs')}
                >
                    <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText, themeStyles.text]}>Activity Logs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                    onPress={() => setActiveTab('settings')}
                >
                    <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText, themeStyles.text]}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Admin Dashboard",
                    headerStyle: { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
                    headerTintColor: isDarkMode ? '#fff' : '#000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
            ) : activeTab === 'settings' ? (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {renderHeader()}

                    <View style={[styles.card, themeStyles.card, { marginTop: 10, padding: 20 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
                            <Ionicons name="settings" size={24} color={isDarkMode ? '#fff' : '#000'} />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>System Settings</Text>
                        </View>

                        {/* Maintenance Mode */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#333' : '#eee' }}>
                            <View style={{ flex: 1, paddingRight: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <Ionicons name="warning" size={20} color="#FF6B6B" />
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: isDarkMode ? '#fff' : '#000' }}>Maintenance Mode</Text>
                                </View>
                                <Text style={{ fontSize: 12, color: '#888' }}>
                                    Lock out all non-admin users. Only do this during emergencies.
                                </Text>
                            </View>
                            <Switch
                                value={isMaintenanceMode}
                                onValueChange={toggleMaintenance}
                                trackColor={{ false: "#767577", true: "#ff4d4d" }}
                                thumbColor={isMaintenanceMode ? "#fff" : "#f4f3f4"}
                            />
                        </View>

                        {/* Global AI Key */}
                        <View style={{ marginTop: 20, gap: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="key" size={20} color="#4dabf7" />
                                <Text style={{ fontSize: 16, fontWeight: '600', color: isDarkMode ? '#fff' : '#000' }}>Global Master AI Key</Text>
                            </View>
                            <Text style={{ fontSize: 12, color: '#888' }}>
                                Fallback key for users without their own API key.
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        backgroundColor: isDarkMode ? '#2c2c2c' : '#f8f9fa',
                                        color: isDarkMode ? '#fff' : '#000',
                                        padding: 12,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: isDarkMode ? '#444' : '#ddd'
                                    }}
                                    value={globalKey}
                                    onChangeText={setGlobalKey}
                                    placeholder="Enter Gemini API Key"
                                    placeholderTextColor="#888"
                                    secureTextEntry
                                />
                                <TouchableOpacity
                                    onPress={saveGlobalKey}
                                    style={{
                                        backgroundColor: '#4dabf7',
                                        paddingHorizontal: 20,
                                        justifyContent: 'center',
                                        borderRadius: 8
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={activeTab === 'users' ? users : logs}
                    renderItem={activeTab === 'users' ? renderUserItem : renderLogItem}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={[styles.emptyText, themeStyles.subText]}>No records found</Text>}
                />
            )}

            {/* Broadcast Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, themeStyles.card]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, themeStyles.text]}>Send Broadcast</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.inputLabel, themeStyles.subText]}>Title</Text>
                        <TextInput style={[styles.input, themeStyles.input]} value={broadcastTitle} onChangeText={setBroadcastTitle} placeholder="Notification Title" placeholderTextColor={isDarkMode ? '#666' : '#999'} />
                        <Text style={[styles.inputLabel, themeStyles.subText]}>Message</Text>
                        <TextInput style={[styles.textArea, themeStyles.input]} value={broadcastMessage} onChangeText={setBroadcastMessage} placeholder="Type your message here..." placeholderTextColor={isDarkMode ? '#666' : '#999'} multiline numberOfLines={4} />
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF' }]} onPress={handleBroadcast}>
                            <Text style={styles.sendButtonText}>Send Notification</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Ban Duration Modal */}
            <Modal animationType="fade" transparent={true} visible={banModalVisible} onRequestClose={() => setBanModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, themeStyles.card]}>
                        <Text style={[styles.modalTitle, themeStyles.text, { marginBottom: 15 }]}>
                            Ban User: {selectedUser?.name}
                        </Text>
                        <Text style={[styles.inputLabel, themeStyles.subText]}>Select Duration:</Text>
                        {['Permanent', '1 Hour', '24 Hours', '7 Days'].map((opt) => {
                            const val = opt === 'Permanent' ? null : opt === '1 Hour' ? 1 : opt === '24 Hours' ? 24 : 168;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.optionButton, banDuration === val && styles.selectedOption]}
                                    onPress={() => setBanDuration(val)}
                                >
                                    <Text style={[styles.optionText, banDuration === val && { color: '#fff' }, themeStyles.text]}>{opt}</Text>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setBanModalVisible(false)} style={styles.cancelButton}>
                                <Text style={{ color: '#FF3B30' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleBanSubmit} style={styles.confirmButton}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser?.isBanned ? 'Update Ban' : 'Ban User'}</Text>
                            </TouchableOpacity>
                        </View>
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
        // Removed custom header style
    },
    backButton: {
        // Removed back button style
    },
    headerTitle: {
        // Removed header title style
    },
    listContent: {
        padding: 15,
        paddingBottom: 40,
    },
    listHeader: {
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statIconContainer: {
        padding: 10,
        borderRadius: 8,
        marginRight: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
    },
    broadcastButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 25,
    },
    broadcastButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        marginTop: 2,
    },
    badges: {
        flexDirection: 'row',
        marginTop: 6,
    },
    adminBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 5,
        borderRadius: 4,
    },
    verifiedBadge: {
        backgroundColor: '#34C759',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    bannedBadge: {
        backgroundColor: '#666',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputLabel: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    sendButton: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    tabText: {
        fontWeight: '600',
        opacity: 0.6,
    },
    activeTabText: {
        opacity: 1,
    },
    logCard: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    logAction: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    logTime: {
        fontSize: 12,
    },
    logDetails: {
        fontSize: 13,
        marginBottom: 4,
    },
    logMeta: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    optionButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 8,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    optionText: {
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    cancelButton: {
        padding: 10,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        paddingHorizontal: 20,
    },
});
