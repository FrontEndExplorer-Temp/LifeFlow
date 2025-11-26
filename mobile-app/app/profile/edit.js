import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import AvatarSelector from '../../components/AvatarSelector';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile, isLoading } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState(user?.gender || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix&size=200&backgroundColor=b6e3f4');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const handleSave = async () => {
        if (password && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const userData = {
            name,
            email,
            gender,
            profilePicture,
            ...(password ? { password } : {}),
        };

        const success = await updateProfile(userData);
        if (success) {
            Alert.alert('Success', 'Profile updated successfully');
            router.replace('/(tabs)/profile');
        }
    };

    const themeStyles = {
        container: {
            backgroundColor: isDarkMode ? '#121212' : '#fff',
        },
        header: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
            borderBottomColor: isDarkMode ? '#333' : '#eee',
        },
        text: {
            color: isDarkMode ? '#fff' : '#333',
        },
        label: {
            color: isDarkMode ? '#aaa' : '#666',
        },
        input: {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#f8f9fa',
            borderColor: isDarkMode ? '#333' : '#eee',
            color: isDarkMode ? '#fff' : '#000',
        }
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <View style={[styles.header, themeStyles.header]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, themeStyles.text]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.form}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <Text style={[styles.label, themeStyles.label]}>Profile Picture</Text>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={() => setShowAvatarSelector(true)}
                    >
                        <Image
                            source={{ uri: profilePicture }}
                            style={styles.avatar}
                        />
                        <View style={styles.avatarEditBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.avatarHint, themeStyles.label]}>Tap to change avatar</Text>
                </View>

                <Text style={[styles.label, themeStyles.label]}>Name</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />

                <Text style={[styles.label, themeStyles.label]}>Email</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={[styles.label, themeStyles.label]}>Gender</Text>
                <View style={styles.genderContainer}>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            gender === 'male' && styles.genderButtonActive,
                            themeStyles.input
                        ]}
                        onPress={() => setGender('male')}
                    >
                        <Ionicons
                            name="male"
                            size={20}
                            color={gender === 'male' ? '#4A90E2' : (isDarkMode ? '#888' : '#999')}
                        />
                        <Text style={[
                            styles.genderText,
                            { color: gender === 'male' ? '#4A90E2' : (isDarkMode ? '#888' : '#999') }
                        ]}>
                            Male
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            gender === 'female' && styles.genderButtonActive,
                            themeStyles.input
                        ]}
                        onPress={() => setGender('female')}
                    >
                        <Ionicons
                            name="female"
                            size={20}
                            color={gender === 'female' ? '#FF69B4' : (isDarkMode ? '#888' : '#999')}
                        />
                        <Text style={[
                            styles.genderText,
                            { color: gender === 'female' ? '#FF69B4' : (isDarkMode ? '#888' : '#999') }
                        ]}>
                            Female
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, themeStyles.label]}>New Password (Optional)</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Leave blank to keep current"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    secureTextEntry
                />

                <Text style={[styles.label, themeStyles.label]}>Confirm New Password</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <AvatarSelector
                visible={showAvatarSelector}
                onClose={() => setShowAvatarSelector(false)}
                onSelect={(avatar) => setProfilePicture(avatar)}
                currentAvatar={profilePicture}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginVertical: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4A90E2',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    genderContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 6,
    },
    genderButtonActive: {
        borderColor: '#4A90E2',
    },
    genderText: {
        fontSize: 15,
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
