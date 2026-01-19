/**
 * ActiveWorkoutScreen - Main screen for active workout session
 * Displays exercises, sets, and rest timer overlay
 */

import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ActiveExerciseCard, RestTimerCard } from '@/components';
import { Heading } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useActiveWorkout, useThemeColors } from '@/hooks';
import { colors, typography, spacing, radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

// Route params type
type ActiveWorkoutRouteProp = RouteProp<RootStackParamList, 'ActiveWorkout'>;
type ActiveWorkoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen() {
    const navigation = useNavigation<ActiveWorkoutNavigationProp>();
    const route = useRoute<ActiveWorkoutRouteProp>();
    const themeColors = useThemeColors();

    // Get workout ID and template ID from route params
    const workoutId = route.params?.workoutId;
    const templateId = route.params?.templateId;
    const initialExercises = route.params?.exercises;

    // Use the active workout hook
    const { workout, exercises, isLoading, error, timerState, actions } = useActiveWorkout(
        workoutId,
        templateId,
        initialExercises
    );

    // Dynamic styles
    const dynamicStyles = useMemo(
        () => ({
            container: { backgroundColor: themeColors.background },
            headerText: { color: themeColors.textPrimary },
            cancelText: { color: themeColors.textMuted },
        }),
        [themeColors]
    );

    // Handle cancel workout
    const handleCancel = useCallback(() => {
        Alert.alert(
            'Cancel Workout',
            'Are you sure you want to cancel this workout? All progress will be lost.',
            [
                { text: 'Keep Training', style: 'cancel' },
                {
                    text: 'Cancel Workout',
                    style: 'destructive',
                    onPress: async () => {
                        await actions.cancelWorkout();
                        navigation.goBack();
                    },
                },
            ]
        );
    }, [actions, navigation]);

    // Handle finish workout
    const handleFinish = useCallback(async () => {
        // Check if any sets are completed
        const hasCompletedSets = exercises.some((ex) =>
            ex.sets.some((set) => set.isCompleted)
        );

        if (!hasCompletedSets) {
            Alert.alert(
                'No Sets Completed',
                'Complete at least one set before finishing your workout.',
                [{ text: 'OK' }]
            );
            return;
        }

        await actions.finishWorkout();
        // TODO: Navigate to workout summary modal
        console.log('[ActiveWorkoutScreen] Workout finished');
        navigation.goBack();
    }, [exercises, actions, navigation]);

    // Handle set change (weight or reps)
    const handleSetChange = useCallback(
        (setId: string, field: 'weight' | 'reps', value: number) => {
            actions.updateSet(setId, field, value);
        },
        [actions]
    );

    // Handle toggle set complete
    const handleToggleComplete = useCallback(
        (setId: string) => {
            actions.toggleSetComplete(setId);
        },
        [actions]
    );

    // Handle add set
    const handleAddSet = useCallback(
        (workoutExerciseId: string) => {
            actions.addSet(workoutExerciseId);
        },
        [actions]
    );

    // Render loading state
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <UIText variant="body" muted style={styles.loadingText}>
                        Loading workout...
                    </UIText>
                </View>
            </SafeAreaView>
        );
    }

    // Render error state
    if (error) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.error} />
                    <UIText variant="body" style={styles.errorText}>
                        {error}
                    </UIText>
                    <Pressable style={styles.retryButton} onPress={actions.refetch}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Render empty state (no workout)
    if (!workout) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="barbell-outline" size={64} color={themeColors.textMuted} />
                    <UIText variant="body" muted style={styles.emptyText}>
                        No active workout
                    </UIText>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={[styles.backButtonText, { color: themeColors.primary }]}>
                            Go Back
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.headerButton}
                        onPress={handleCancel}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[styles.cancelButtonText, dynamicStyles.cancelText]}>
                            Cancel
                        </Text>
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Heading level={3} style={dynamicStyles.headerText}>
                            {workout.name || 'Current Workout'}
                        </Heading>
                    </View>

                    <Pressable
                        style={styles.headerButton}
                        onPress={handleFinish}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.finishButtonText}>Finish</Text>
                    </Pressable>
                </View>

                {/* Exercises List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        timerState.isActive && styles.scrollContentWithTimer,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {exercises.length === 0 ? (
                        <View style={styles.noExercisesContainer}>
                            <Ionicons
                                name="add-circle-outline"
                                size={48}
                                color={themeColors.textMuted}
                            />
                            <UIText variant="body" muted style={styles.noExercisesText}>
                                No exercises added yet.{'\n'}Add exercises to start your workout.
                            </UIText>
                        </View>
                    ) : (
                        exercises.map((exercise) => (
                            <ActiveExerciseCard
                                key={exercise.workoutExerciseId}
                                exerciseName={exercise.name}
                                sets={exercise.sets}
                                onAddSet={() => handleAddSet(exercise.workoutExerciseId)}
                                onSetChange={(setId, field, value) =>
                                    handleSetChange(setId, field, value)
                                }
                                onToggleComplete={(setId) => handleToggleComplete(setId)}
                                onMenuPress={() => {
                                    // TODO: Show exercise options menu
                                    console.log('Menu pressed for:', exercise.name);
                                }}
                                testID={`exercise-card-${exercise.id}`}
                            />
                        ))
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Rest Timer Overlay */}
            {timerState.isActive && (
                <View style={styles.timerOverlay}>
                    <RestTimerCard
                        seconds={timerState.restSeconds}
                        onAdd={() => {
                            // TODO: Add 10 seconds to timer
                            console.log('Add 10s to timer');
                        }}
                        onSubtract={() => {
                            actions.dismissTimer();
                        }}
                        testID="rest-timer"
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.dark,
    },
    headerButton: {
        minWidth: 60,
        paddingVertical: spacing.xs,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.medium,
    },
    finishButtonText: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.DEFAULT,
        textAlign: 'right',
    },

    // Content
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    scrollContentWithTimer: {
        paddingBottom: 160, // Extra padding for timer overlay
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        marginTop: spacing.sm,
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    errorText: {
        textAlign: 'center',
        color: colors.error,
    },
    retryButton: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: radius.lg,
    },
    retryText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    emptyText: {
        textAlign: 'center',
    },
    backButton: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    backButtonText: {
        fontWeight: typography.fontWeight.semibold,
    },

    // No Exercises
    noExercisesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        gap: spacing.md,
    },
    noExercisesText: {
        textAlign: 'center',
    },

    // Timer Overlay
    timerOverlay: {
        position: 'absolute',
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
    },
});
