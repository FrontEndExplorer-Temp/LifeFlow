import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmail() {
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useThemeStore();
    const { checkVerificationStatus } = useAuthStore();

    useEffect(() => {
        let interval;
        if (email) {
            interval = setInterval(async () => {
                const verified = await checkVerificationStatus(email);
                if (verified) {
                    clearInterval(interval);
                    // Redirect is handled in store upon success
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [email]);

    const handleManualCheck = async () => {
        await checkVerificationStatus(email);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}>
            <Ionicons name="mail-open-outline" size={80} color={isDarkMode ? '#4A90E2' : '#007AFF'} />
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Verify your Email</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                We've sent a verification link to {email}. Please check your inbox and click the link.
            </Text>

            <ActivityIndicator size="large" color={isDarkMode ? '#4A90E2' : '#007AFF'} style={styles.loader} />
            <Text style={[styles.status, { color: isDarkMode ? '#aaa' : '#888' }]}>
                Waiting for verification...
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
                onPress={handleManualCheck}
            >
                <Text style={[styles.buttonText, { color: isDarkMode ? '#fff' : '#000' }]}>I've verified my email</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.replace('/(auth)/login')}
            >
                <Text style={[styles.linkText, { color: isDarkMode ? '#4A90E2' : '#007AFF' }]}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    loader: {
        marginBottom: 20,
    },
    status: {
        fontSize: 14,
        marginBottom: 40,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 10,
    },
    linkText: {
        fontSize: 16,
    }
});
