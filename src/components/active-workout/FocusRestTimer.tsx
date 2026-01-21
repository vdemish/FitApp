import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { typography, spacing, radius, colors } from '@/theme';
import { useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';

export interface FocusRestTimerProps {
    /** Is the timer visible? */
    isVisible: boolean;
    /** Time in seconds remaining */
    secondsRemaining: number;
    /** Add or subtract time (in seconds) */
    onAddSeconds: (seconds: number) => void;
    /** Close/Skip the timer */
    onClose: () => void;
}

export function FocusRestTimer({
    isVisible,
    secondsRemaining,
    onAddSeconds,
    onClose,
}: FocusRestTimerProps) {
    const themeColors = useThemeColors();

    // Format MM:SS
    const minutes = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 1)' }]}>
                {/* Timer Display */}
                <View style={styles.timerContainer}>
                    <Text style={[styles.timerLabel, { color: themeColors.textMuted }]}>
                        TAKE A REST
                    </Text>
                    <View style={styles.timeRow}>
                        <Text style={[styles.timeDigits, { color: themeColors.textPrimary }]}>
                            {formattedMinutes}
                        </Text>
                        <Text style={[styles.timeSeparator, { color: themeColors.primary }]}>
                            :
                        </Text>
                        <Text style={[styles.timeDigits, { color: themeColors.primary }]}>
                            {formattedSeconds}
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    {/* -10s Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.controlButton,
                            styles.adjustButton,
                            { borderColor: themeColors.border },
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onAddSeconds(-10);
                        }}
                    >
                        <Text style={[styles.adjustButtonText, { color: themeColors.textSecondary }]}>
                            -10s
                        </Text>
                    </Pressable>

                    {/* Skip Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.controlButton,
                            styles.skipButton,
                            { backgroundColor: `${colors.error}20` }, // 20% opacity red
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onClose();
                        }}
                    >
                        <Text style={[styles.skipButtonText, { color: colors.error }]}>
                            SKIP
                        </Text>
                    </Pressable>

                    {/* +30s Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.controlButton,
                            styles.adjustButton,
                            { borderColor: themeColors.primary },
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onAddSeconds(30);
                        }}
                    >
                        <Text style={[styles.adjustButtonText, { color: themeColors.primary }]}>
                            +30s
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    timerLabel: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: 4,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline', // Align digits and separator nicely
        justifyContent: 'center',
    },
    timeDigits: {
        fontSize: 96, // Massive font size
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
    },
    timeSeparator: {
        fontSize: 96,
        fontWeight: 'bold',
        marginHorizontal: spacing.xs,
        opacity: 0.8,
        transform: [{ translateY: -8 }], // Slight optical adjustment
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        width: '100%',
        justifyContent: 'space-between',
        maxWidth: 400, // Dont get too wide on tablets
    },
    controlButton: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40, // Perfectly round for square buttons, pill for wide ones
        borderWidth: 2,
    },
    adjustButton: {
        width: 80, // Circle
        backgroundColor: 'transparent',
    },
    skipButton: {
        flex: 1, // Take remaining space
        borderWidth: 0,
        elevation: 0,
    },
    adjustButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButtonText: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
});
