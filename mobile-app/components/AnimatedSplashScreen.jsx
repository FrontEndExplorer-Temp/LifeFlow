import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onFinish }) => {
    const insets = useSafeAreaInsets();

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation Sequence
        Animated.sequence([
            // 1. Fade in and Scale up the Icon
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Fade in the Text
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
            // 3. Wait a moment
            Animated.delay(1000),
        ]).start(() => {
            // 4. Callback to finish (parent will handle unmounting/transition)
            if (onFinish) onFinish();
        });
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.contentContainer}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        alignItems: 'center',
                    }}
                >
                    <Image
                        source={require('../assets/icon-2.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={{ opacity: textFadeAnim }}>
                    <Text style={styles.appName}>TimeFlow</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC', // Matches app.json/splash background if possible, or use theme
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it's on top
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: width * 0.35, // 35% of screen width
        height: width * 0.35,
        marginBottom: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4A90E2', // Primary color from app.json
        letterSpacing: 2,
    },
});

export default AnimatedSplashScreen;
