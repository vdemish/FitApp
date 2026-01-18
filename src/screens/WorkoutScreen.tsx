/**
 * WorkoutScreen - Главный экран тренировки
 * Connected to real database via useWorkout hook
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { RestTimerCard, IncrementDecrementInput } from '@/components';
import { useWorkout } from '@/hooks';
import { colors, typography, spacing, radius } from '@/theme';
import type { WorkoutExercise, Set } from '@/types';

export function WorkoutScreen() {
    const {
        workout,
        loading,
        startWorkout,
        finishWorkout,
        logSet,
    } = useWorkout();

    // Локальное состояние для ввода
    const [weight, setWeight] = useState(30.0);
    const [reps, setReps] = useState(12);
    const [restSeconds, setRestSeconds] = useState(90);

    // Текущее упражнение (первое не завершённое)
    const currentExercise = workout?.exercises?.[0];
    const currentSet = currentExercise?.sets?.find(s => s.status === 'pending');
    const completedSets = currentExercise?.sets?.filter(s => s.status === 'completed') || [];
    const totalSets = currentExercise?.sets?.length || 4;
    const currentSetNumber = completedSets.length + 1;

    // Следующее упражнение
    const nextExercise = workout?.exercises?.[1];

    // Таймер
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        if (timerActive && restSeconds > 0) {
            const timer = setTimeout(() => setRestSeconds(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (restSeconds === 0) {
            setTimerActive(false);
        }
    }, [timerActive, restSeconds]);

    const handleLogSet = async () => {
        if (!currentSet) return;

        try {
            await logSet(currentSet.id, weight, reps);
            // Запускаем таймер после логирования
            setRestSeconds(90);
            setTimerActive(true);
        } catch (err) {
            console.error('Ошибка логирования:', err);
        }
    };

    const handleFinishWorkout = async () => {
        try {
            await finishWorkout();
        } catch (err) {
            console.error('Ошибка завершения:', err);
        }
    };

    const handleStartNewWorkout = async () => {
        try {
            await startWorkout('Quick Workout');
        } catch (err) {
            console.error('Ошибка создания тренировки:', err);
        }
    };

    const handleAddRestTime = () => {
        setRestSeconds(prev => prev + 10);
    };

    const handleSubtractRestTime = () => {
        setRestSeconds(prev => Math.max(0, prev - 5));
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    <UIText variant="body-sm" muted style={styles.loadingText}>
                        Загрузка тренировки...
                    </UIText>
                </View>
            </SafeAreaView>
        );
    }

    // No active workout
    if (!workout) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏋️</Text>
                    <Heading level={2}>Ready to Train?</Heading>
                    <UIText variant="body" muted style={styles.emptyText}>
                        Start a new workout to begin logging your sets
                    </UIText>
                    <Button
                        variant="primary"
                        size="lg"
                        glow
                        onPress={handleStartNewWorkout}
                        style={styles.startButton}
                    >
                        START WORKOUT
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    // No exercises in workout
    if (!currentExercise) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📚</Text>
                    <Heading level={2}>Add Exercises</Heading>
                    <UIText variant="body" muted style={styles.emptyText}>
                        Go to Library tab to add exercises to your workout
                    </UIText>
                </View>
            </SafeAreaView>
        );
    }

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
                        <Heading level={2}>
                            {currentExercise.exercise?.name || 'Exercise'}
                        </Heading>
                        <View style={styles.lastSetRow}>
                            <Text style={styles.historyIcon}>⏱</Text>
                            <UIText variant="body-sm" muted>
                                {completedSets.length > 0
                                    ? `Last: ${completedSets[completedSets.length - 1].weight}kg × ${completedSets[completedSets.length - 1].reps}`
                                    : 'First set'
                                }
                            </UIText>
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
                                Set {currentSetNumber} of {totalSets}
                            </UIText>
                            <UIText variant="caption" muted style={styles.zoneLabel}>
                                {currentExercise.exercise?.exercise_type || 'Compound'}
                            </UIText>
                        </View>
                        <View style={styles.setIndicators}>
                            {Array.from({ length: Math.min(totalSets, 4) }, (_, i) => {
                                const isCompleted = i < completedSets.length;
                                const isCurrent = i === completedSets.length;
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.setDot,
                                            isCompleted && styles.setDotComplete,
                                            isCurrent && styles.setDotCurrent,
                                        ]}
                                    >
                                        {isCompleted ? (
                                            <Text style={styles.checkIcon}>✓</Text>
                                        ) : isCurrent ? (
                                            <Text style={styles.setNumber}>{i + 1}</Text>
                                        ) : null}
                                    </View>
                                );
                            })}
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
                        disabled={!currentSet}
                        testID="log-set-button"
                    >
                        <Text style={styles.logSetIcon}>✓✓</Text>
                        <Text style={styles.logSetText}>LOG SET</Text>
                    </Pressable>
                </GlassCard>

                {/* Up Next Preview */}
                {nextExercise && (
                    <GlassCard style={styles.upNextCard}>
                        <View style={styles.upNextIcon}>
                            <Text style={styles.dumbbellIcon}>🏋️</Text>
                        </View>
                        <View style={styles.upNextInfo}>
                            <Label>Up Next</Label>
                            <Heading level={3} style={styles.upNextTitle}>
                                {nextExercise.exercise?.name || 'Next Exercise'}
                            </Heading>
                        </View>
                        <Text style={styles.dragHandle}>≡</Text>
                    </GlassCard>
                )}

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
                    <Pressable style={styles.finishButton} onPress={handleFinishWorkout}>
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
        paddingBottom: 160,
        gap: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    startButton: {
        marginTop: spacing.lg,
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
        backgroundColor: colors.surface.dark,
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
        bottom: 100,
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
