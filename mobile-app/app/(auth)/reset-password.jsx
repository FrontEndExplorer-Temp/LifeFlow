import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
    const { token: paramToken } = useLocalSearchParams();
    const [token, setToken] = useState(paramToken || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const { isDarkMode } = useThemeStore();
    const { resetPassword, isLoading } = useAuthStore();

    const handleReset = async () => {
        if (!token || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        const success = await resetPassword(token, password);
        if (success) {
            Alert.alert('Success', 'Password has been reset', [
                { text: 'Login', onPress: () => router.replace('/(auth)/login') }
            ]);
        }
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        text: { color: isDarkMode ? '#fff' : '#000' },
        input: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#000',
            borderColor: isDarkMode ? '#333' : '#e0e0e0'
        },
        placeholder: isDarkMode ? '#888' : '#999'
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={themeStyles.text.color} />
            </TouchableOpacity>

            <Text style={[styles.title, themeStyles.text]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: themeStyles.placeholder }]}>
                Enter your token and new password.
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color={themeStyles.placeholder} style={styles.icon} />
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    placeholder="Reset Token"
                    placeholderTextColor={themeStyles.placeholder}
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                />
            </View>

            <View style={[styles.passwordContainer, { borderColor: themeStyles.input.borderColor, backgroundColor: themeStyles.input.backgroundColor }]}>
                <TextInput
                    style={[styles.passwordInput, { color: themeStyles.input.color }]}
                    placeholder="New Password"
                    placeholderTextColor={themeStyles.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={themeStyles.placeholder} />
                </TouchableOpacity>
            </View>

            <View style={[styles.passwordContainer, { borderColor: themeStyles.input.borderColor, backgroundColor: themeStyles.input.backgroundColor }]}>
                <TextInput
                    style={[styles.passwordInput, { color: themeStyles.input.color }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={themeStyles.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={themeStyles.placeholder} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleReset}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 45,
        borderWidth: 1,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 20,
        paddingRight: 15,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
