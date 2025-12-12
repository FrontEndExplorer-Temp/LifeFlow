import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '../store/themeStore';

const { width } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onFinish, isAppReady }) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useThemeStore();

    // -- ANIMATION VALUES --
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.96)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(8)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    // Track if entrance is done so we can trigger exit immediately if app is already ready
    const [entranceFinished, setEntranceFinished] = React.useState(false);

    useEffect(() => {
        // -- ENTRANCE ANIMATION --
        Animated.sequence([
            // Step 1: Logo Entrance (0.3s)
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

            // Step 2: App Name Fade-in (0.4s)
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

            // Step 3: Minimum Hold (0.5s)
            Animated.delay(500),

        ]).start(() => {
            setEntranceFinished(true);
        });
    }, []);

    // -- EXIT TRIGGER --
    useEffect(() => {
        if (entranceFinished && isAppReady) {
            // Run Exit Animation
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                if (onFinish) onFinish();
            });
        }
    }, [entranceFinished, isAppReady]);

    // -- COLORS --
    const backgroundColor = isDarkMode ? '#0E0E10' : '#FFFFFF';
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#111111';

    // Glow Colors & Opacity
    const glowInner = '#3AB4FF';
    const glowOuter = '#7B4DFF';
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
            {/* Glow Layer */}
            <Animated.View
                style={[
                    styles.glowContainer,
                    { opacity: glowOpacity }
                ]}
            >
                <LinearGradient
                    colors={glowColors}
                    style={styles.glow}
                    start={{ x: 0.5, y: 0.5 }}
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
