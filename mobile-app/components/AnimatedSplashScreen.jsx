import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/themeStore';

const { width } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onFinish }) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useThemeStore();

    // -- ANIMATION VALUES --
    // Logo: Opacity 0 -> 1, Scale 0.96 -> 1.0
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.96)).current;

    // Glow: Opacity 0 -> 1 (Softly increases with logo)
    const glowOpacity = useRef(new Animated.Value(0)).current;

    // Text: Opacity 0 -> 1, TranslateY 8 -> 0
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(8)).current;

    // Container Exit
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Total Duration: 1.2s Sequence + Hold
        Animated.sequence([
            // Step 1: Logo Entrance (0.0s -> 0.3s)
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),

            // Step 2: App Name Fade-in (0.3s -> 0.7s) -> Duration 400ms
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            // Step 3: Hold (0.7s -> 1.2s) -> Duration 500ms
            Animated.delay(500),

            // Step 4: Optional Soft Fade Out to Home (Extra Polish)
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (onFinish) onFinish();
        });
    }, []);

    // -- COLORS --
    const backgroundColor = isDarkMode ? '#0E0E10' : '#FFFFFF';
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#111111';

    // Glow Colors & Opacity
    const glowInner = '#3AB4FF';
    const glowOuter = '#7B4DFF';
    // Light: Inner 12%, Outer 8% -> approx 0.12, 0.08 alpha
    // Dark: Inner 30%, Outer 20% -> approx 0.30, 0.20 alpha
    const glowColors = isDarkMode
        ? ['rgba(58, 180, 255, 0.30)', 'rgba(123, 77, 255, 0.20)', 'transparent']
        : ['rgba(58, 180, 255, 0.12)', 'rgba(123, 77, 255, 0.08)', 'transparent'];

    return (
        <Animated.View style={[
            styles.container,
            {
                paddingTop: insets.top,
                backgroundColor: backgroundColor,
                opacity: containerOpacity
            }
        ]}>
            {/* Glow Layer - Now fills the entire screen container due to absoluteFillObject */}
            <Animated.View
                style={[
                    styles.glowContainer,
                    { opacity: glowOpacity }
                ]}
            >
                <LinearGradient
                    colors={glowColors}
                    style={styles.glow}
                    start={{ x: 0.5, y: 0.5 }} // Radial-ish from center
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            <View style={styles.contentContainer}>
                {/* Logo */}
                <Animated.View
                    style={{
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                        zIndex: 2,
                    }}
                >
                    <Image
                        source={require('../assets/icon-2.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* App Name */}
                <Animated.View
                    style={{
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                        marginTop: 16,
                        zIndex: 2,
                    }}
                >
                    <Text style={[styles.appName, { color: textColor }]}>TimeFlow</Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1, // Behind logo (logo is 2)
    },
    glow: {
        flex: 1,
    },
    logo: {
        width: 150, // Fixed height as requested
        height: 150,
        // width: 'auto' is tricky in RN without knowing aspect ratio, Assuming square icon or sufficient width
    },
    appName: {
        fontSize: 26, // 24-28px
        fontWeight: '600',
        letterSpacing: 0.2,
        fontFamily: 'System', // Fallback to system font if Poppins/Inter not loaded
    },
});

export default AnimatedSplashScreen;
