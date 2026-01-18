/**
 * WorkoutScreen - Главный экран тренировки
 * Redesigned with glassmorphism design system
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { RestTimerCard, IncrementDecrementInput } from '@/components';
import { colors, typography, spacing, radius } from '@/theme';

export function WorkoutScreen() {
    // Состояние для текущего упражнения
    const [weight, setWeight] = useState(34.0);
    const [reps, setReps] = useState(12);
    const [restSeconds, setRestSeconds] = useState(88); // 01:28

    const handleLogSet = () => {
        // TODO: Сохранение сета в базу данных
        console.log('Log set:', { weight, reps });
    };

    const handleAddRestTime = () => {
        setRestSeconds(prev => prev + 10);
    };

    const handleSubtractRestTime = () => {
        setRestSeconds(prev => Math.max(0, prev - 5));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Rest Timer Card */}
                <RestTimerCard
                    seconds={restSeconds}
                    onAdd={handleAddRestTime}
                    onSubtract={handleSubtractRestTime}
                    testID="rest-timer"
                />

                {/* Exercise Info Header */}
                <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                        <Heading level={2}>Incline Dumbbell Press</Heading>
                        <View style={styles.lastSetRow}>
                            <Text style={styles.historyIcon}>⏱</Text>
                            <UIText variant="body-sm" muted>Last: 32kg × 10</UIText>
                        </View>
                    </View>
                    <Button variant="icon" size="sm">
                        <Text style={styles.infoIcon}>ℹ️</Text>
                    </Button>
                </View>

                {/* Main Logging Card */}
                <GlassCard accent="primary" style={styles.loggingCard}>
                    {/* Set Progress Header */}
                    <View style={styles.setHeader}>
                        <View>
                            <UIText variant="body-sm" accent uppercase style={styles.setLabel}>
                                Set 3 of 4
                            </UIText>
                            <UIText variant="caption" muted style={styles.zoneLabel}>
                                Hypertrophy Zone
                            </UIText>
                        </View>
                        <View style={styles.setIndicators}>
                            <View style={[styles.setDot, styles.setDotComplete]}>
                                <Text style={styles.checkIcon}>✓</Text>
                            </View>
                            <View style={[styles.setDot, styles.setDotComplete]}>
                                <Text style={styles.checkIcon}>✓</Text>
                            </View>
                            <View style={[styles.setDot, styles.setDotCurrent]}>
                                <Text style={styles.setNumber}>3</Text>
                            </View>
                        </View>
                    </View>

                    {/* Weight Input */}
                    <View style={styles.inputSection}>
                        <IncrementDecrementInput
                            label="Weight (kg)"
                            value={weight}
                            onChange={setWeight}
                            step={1}
                            min={0}
                            decimals={1}
                            testID="weight-input"
                        />
                    </View>

                    {/* Reps Input */}
                    <View style={styles.inputSection}>
                        <IncrementDecrementInput
                            label="Repetitions"
                            value={reps}
                            onChange={setReps}
                            step={1}
                            min={0}
                            testID="reps-input"
                        />
                    </View>

                    {/* Log Set Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.logSetButton,
                            pressed && styles.logSetButtonPressed,
                        ]}
                        onPress={handleLogSet}
                        testID="log-set-button"
                    >
                        <Text style={styles.logSetIcon}>✓✓</Text>
                        <Text style={styles.logSetText}>LOG SET</Text>
                    </Pressable>
                </GlassCard>

                {/* Up Next Preview */}
                <GlassCard style={styles.upNextCard}>
                    <View style={styles.upNextIcon}>
                        <Text style={styles.dumbbellIcon}>🏋️</Text>
                    </View>
                    <View style={styles.upNextInfo}>
                        <Label>Up Next</Label>
                        <Heading level={3} style={styles.upNextTitle}>Lateral Raises</Heading>
                    </View>
                    <Text style={styles.dragHandle}>≡</Text>
                </GlassCard>

                {/* Add Set Button */}
                <Pressable style={styles.addSetButton} testID="add-set-button">
                    <Text style={styles.addSetIcon}>+</Text>
                    <Text style={styles.addSetText}>ADD SET</Text>
                </Pressable>
            </ScrollView>

            {/* Floating Action Bar */}
            <View style={styles.floatingBar}>
                <GlassCard style={styles.floatingBarContent}>
                    <Button variant="secondary" size="lg">
                        <Text style={styles.swapIcon}>⇄</Text>
                    </Button>
                    <Pressable style={styles.finishButton}>
                        <Text style={styles.finishButtonText}>FINISH WORKOUT</Text>
                        <Text style={styles.finishButtonIcon}>🏁</Text>
                    </Pressable>
                </GlassCard>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.dark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 160, // Space for floating bar
        gap: spacing.lg,
    },

    // Exercise Header
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.xs,
    },
    exerciseInfo: {
        flex: 1,
    },
    lastSetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: spacing.xs,
    },
    historyIcon: {
        fontSize: 14,
        color: colors.text.muted.dark,
    },
    infoIcon: {
        fontSize: 20,
    },

    // Logging Card
    loggingCard: {
        padding: spacing.xl,
    },
    setHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    setLabel: {
        letterSpacing: 2,
    },
    zoneLabel: {
        marginTop: 4,
        fontStyle: 'italic',
        textTransform: 'none',
    },
    setIndicators: {
        flexDirection: 'row',
        marginLeft: -8,
    },
    setDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
        borderWidth: 2,
        borderColor: colors.background.dark,
    },
    setDotComplete: {
        backgroundColor: `${colors.success}33`,
    },
    setDotCurrent: {
        backgroundColor: `${colors.primary.DEFAULT}33`,
        borderColor: colors.primary.DEFAULT,
    },
    checkIcon: {
        fontSize: 14,
        color: colors.success,
    },
    setNumber: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary.DEFAULT,
    },
    inputSection: {
        marginBottom: spacing.xl,
    },
    logSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 80,
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderWidth: 2,
        borderColor: colors.primary.DEFAULT,
        borderRadius: radius.xl,
        marginTop: spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    logSetButtonPressed: {
        backgroundColor: colors.primary.DEFAULT,
    },
    logSetIcon: {
        fontSize: 32,
        color: colors.primary.DEFAULT,
    },
    logSetText: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.DEFAULT,
        letterSpacing: 3,
    },

    // Up Next
    upNextCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        opacity: 0.6,
        gap: spacing.md,
    },
    upNextIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.xl,
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderWidth: 1,
        borderColor: `${colors.primary.DEFAULT}33`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dumbbellIcon: {
        fontSize: 28,
    },
    upNextInfo: {
        flex: 1,
    },
    upNextTitle: {
        marginTop: 4,
    },
    dragHandle: {
        fontSize: 24,
        color: colors.text.muted.dark,
    },

    // Add Set
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 56,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border.dark,
        borderRadius: radius.xl,
    },
    addSetIcon: {
        fontSize: 24,
        color: colors.text.muted.dark,
    },
    addSetText: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.muted.dark,
        letterSpacing: 2,
    },

    // Floating Bar
    floatingBar: {
        position: 'absolute',
        bottom: 100, // Above tab bar
        left: spacing.md,
        right: spacing.md,
    },
    floatingBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        gap: spacing.md,
    },
    swapIcon: {
        fontSize: 24,
        color: colors.text.secondary.dark,
    },
    finishButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 64,
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: radius.xl,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    finishButtonText: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        color: colors.background.dark,
        letterSpacing: 1,
    },
    finishButtonIcon: {
        fontSize: 20,
    },
});
