import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import useSkillStore from '../../store/skillStore';
import useThemeStore from '../../store/themeStore';

export default function CreateSkillScreen() {
    const router = useRouter();
    const { theme } = useThemeStore();
    const { createSkill } = useSkillStore();

    const [form, setForm] = useState({
        name: '',
        category: 'Development', // Default
        currentLevel: 'Beginner',
        targetLevel: 'Advanced',
        minutesPerDay: '30'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            Alert.alert('Error', 'Please enter a skill name.');
            return;
        }

        setIsLoading(true);
        try {
            await createSkill({
                ...form,
                minutesPerDay: parseInt(form.minutesPerDay) || 30
            });
            Alert.alert('Success', 'Skill created!');
            router.back();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create skill');
        } finally {
            setIsLoading(false);
        }
    };

    const themeStyles = {
        container: { backgroundColor: theme.colors.background },
        text: { color: theme.colors.text },
        input: { backgroundColor: theme.colors.input, color: theme.colors.text, borderColor: theme.colors.border },
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
            <Stack.Screen options={{ title: 'Add New Skill' }} />

            <View style={styles.formGroup}>
                <Text style={[styles.label, themeStyles.text]}>Skill Name</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    placeholder="e.g. React Native, Guitar, Spanish"
                    placeholderTextColor={theme.colors.subText}
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, themeStyles.text]}>Category</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    placeholder="e.g. Development, Music, Language"
                    placeholderTextColor={theme.colors.subText}
                    value={form.category}
                    onChangeText={(text) => setForm({ ...form, category: text })}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, themeStyles.text]}>Current Level</Text>
                    <TextInput
                        style={[styles.input, themeStyles.input]}
                        value={form.currentLevel}
                        onChangeText={(text) => setForm({ ...form, currentLevel: text })}
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, themeStyles.text]}>Target Level</Text>
                    <TextInput
                        style={[styles.input, themeStyles.input]}
                        value={form.targetLevel}
                        onChangeText={(text) => setForm({ ...form, targetLevel: text })}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, themeStyles.text]}>Minutes Per Day</Text>
                <TextInput
                    style={[styles.input, themeStyles.input]}
                    placeholder="30"
                    placeholderTextColor={theme.colors.subText}
                    keyboardType="numeric"
                    value={form.minutesPerDay}
                    onChangeText={(text) => setForm({ ...form, minutesPerDay: text })}
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Skill</Text>
                )}
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
