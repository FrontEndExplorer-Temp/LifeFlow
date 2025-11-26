import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const router = useRouter();
    const { isDarkMode } = useThemeStore();
    const { forgotPassword, isLoading } = useAuthStore();

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        const success = await forgotPassword(email);
        if (success) {
            Alert.alert('Success', 'Password reset link sent to your email', [
                { text: 'Enter Token', onPress: () => router.push('/(auth)/reset-password') }
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

            <Text style={[styles.title, themeStyles.text]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: themeStyles.placeholder }]}>
                Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={themeStyles.placeholder} style={styles.icon} />
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    placeholder="Email"
                    placeholderTextColor={themeStyles.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleReset}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
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
