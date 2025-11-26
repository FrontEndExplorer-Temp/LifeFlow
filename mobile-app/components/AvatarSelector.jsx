import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../store/themeStore';

const { width } = Dimensions.get('window');

// DiceBear avatar styles and seeds for variety
const AVATAR_STYLES = [
    { style: 'avataaars', seed: 'Felix', name: 'Happy' },
    { style: 'avataaars', seed: 'Aneka', name: 'Cheerful' },
    { style: 'avataaars', seed: 'Bella', name: 'Friendly' },
    { style: 'avataaars', seed: 'Charlie', name: 'Cool' },
    { style: 'bottts', seed: 'Robot1', name: 'Bot Blue' },
    { style: 'bottts', seed: 'Robot2', name: 'Bot Green' },
    { style: 'personas', seed: 'Emma', name: 'Professional' },
    { style: 'personas', seed: 'Oliver', name: 'Business' },
];

export default function AvatarSelector({ visible, onClose, onSelect, currentAvatar }) {
    const { theme, isDarkMode } = useThemeStore();
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

    const getAvatarUrl = (avatarStyle, seed) => {
        return `https://api.dicebear.com/7.x/${avatarStyle}/png?seed=${seed}&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    const handleSelect = () => {
        onSelect(selectedAvatar);
        onClose();
    };

    const styles = getStyles(theme, isDarkMode);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Choose Your Avatar</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.avatarGrid}>
                        {AVATAR_STYLES.map((avatar, index) => {
                            const avatarUrl = getAvatarUrl(avatar.style, avatar.seed);
                            const isSelected = selectedAvatar === avatarUrl;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.avatarItem,
                                        isSelected && styles.avatarItemSelected
                                    ]}
                                    onPress={() => setSelectedAvatar(avatarUrl)}
                                >
                                    <Image
                                        source={{ uri: avatarUrl }}
                                        style={styles.avatarImage}
                                    />
                                    <Text style={styles.avatarName}>{avatar.name}</Text>
                                    {isSelected && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
                        <Text style={styles.selectButtonText}>Select Avatar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    closeButton: {
        padding: 4,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    avatarItem: {
        width: (width - 48) / 4,
        alignItems: 'center',
        marginBottom: 20,
        padding: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarItemSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    avatarName: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    selectButton: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
