/**
 * ActiveWorkoutScreen - Main screen for active workout session
 * Displays exercises, sets, and rest timer overlay
 */

import React, { useMemo, useCallback, useEffect } from 'react';
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

import { ActiveExerciseCard, RestTimerCard, AddExerciseModal } from '@/components';
import { Heading } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useActiveWorkout, useThemeColors } from '@/hooks';
import { triggerTimerTick, triggerSuccess, triggerSelection } from '@/utils/haptics';
import { colors, typography, spacing, radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

// Route params type
type ActiveWorkoutRouteProp = RouteProp<RootStackParamList, 'ActiveWorkout'>;
type ActiveWorkoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen() {
    const navigation = useNavigation<ActiveWorkoutNavigationProp>();
    const route = useRoute<ActiveWorkoutRouteProp>();
    const themeColors = useThemeColors();
    const [isAddExerciseModalVisible, setAddExerciseModalVisible] = React.useState(false);

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
            headerText: {
                color: themeColors.textPrimary,
                fontVariant: ['tabular-nums'] as any,
            },
            cancelText: { color: themeColors.textMuted },
            addExerciseButton: { backgroundColor: themeColors.surface },
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

    // Calculate active exercise ID (first exercise with incomplete sets)
    const activeExerciseId = useMemo(() => {
        return exercises.find(ex => ex.sets.some(s => !s.isCompleted))?.id;
    }, [exercises]);

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

    // Timer interval logic
    const [remainingTime, setRemainingTime] = React.useState(0);
    const lastHapticTimeRef = React.useRef<number>(-1);

    // Reset haptic ref when timer starts
    useEffect(() => {
        if (timerState.isActive) {
            lastHapticTimeRef.current = -1;
        }
    }, [timerState.isActive, timerState.lastCompletedSetTimestamp]);

    // Update remaining time when timer state changes or on interval
    useEffect(() => {
        if (!timerState.isActive || !timerState.lastCompletedSetTimestamp) {
            setRemainingTime(0);
            return;
        }

        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - timerState.lastCompletedSetTimestamp!) / 1000);
            const remaining = Math.max(0, timerState.restSeconds - elapsed);
            setRemainingTime(remaining);

            // Haptic Feedback
            if (remaining !== lastHapticTimeRef.current) {
                if (remaining <= 5 && remaining > 0) {
                    triggerTimerTick();
                } else if (remaining === 0) {
                    triggerSuccess();
                }
                lastHapticTimeRef.current = remaining;
            }

            // Auto-dismiss if 0
            if (remaining === 0) actions.dismissTimer();
        };

        updateTimer(); // Initial update
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [timerState.isActive, timerState.lastCompletedSetTimestamp, timerState.restSeconds]);

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
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.headerButton}
                        onPress={() => {
                            triggerSelection();
                            handleCancel();
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[styles.cancelButtonText, dynamicStyles.cancelText]}>
                            Cancel
                        </Text>
                    </Pressable>

                    <View style={styles.headerCenter}>
                        <Heading level={3} style={dynamicStyles.headerText}>
                            {workout.name || 'Current Workout'}
                            {workout.started_at && `, `}
                            {workout.started_at && (
                                <WorkoutTimer startedAt={workout.started_at} />
                            )}
                        </Heading>
                    </View>

                    <Pressable
                        style={styles.headerButton}
                        onPress={() => {
                            triggerSelection();
                            handleFinish();
                        }}
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
                                    console.log('Menu pressed for:', exercise.name);
                                }}
                                testID={`exercise-card-${exercise.id}`}
                                isResting={timerState.isActive}
                                isActiveExercise={exercise.id === activeExerciseId}
                            />
                        ))
                    )}

                    {/* Add Exercise Button (Static) */}
                    <View style={styles.addExerciseContainer}>
                        <Pressable
                            style={[styles.addExerciseButton, dynamicStyles.addExerciseButton]}
                            onPress={() => {
                                triggerSelection();
                                setAddExerciseModalVisible(true);
                            }}
                        >
                            <Ionicons name="add" size={24} color={themeColors.primary} />
                            <UIText variant="body" style={{ color: themeColors.primary, fontWeight: '600' }}>
                                Add Exercise
                            </UIText>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Rest Timer Overlay */}
            {timerState.isActive && (
                <View style={styles.timerOverlay}>
                    <RestTimerCard
                        seconds={remainingTime}
                        onAdd30={() => actions.addRestTime(30)}
                        onSubtract10={() => actions.addRestTime(-10)}
                        onSkip={actions.dismissTimer}
                        testID="rest-timer"
                    />
                </View>
            )}

            <AddExerciseModal
                visible={isAddExerciseModalVisible}
                onClose={() => setAddExerciseModalVisible(false)}
                onAdd={actions.addExercises}
            />
        </SafeAreaView>
    );
}

// Helper component for workout timer
function WorkoutTimer({ startedAt }: { startedAt: string | Date }) {
    const [duration, setDuration] = React.useState('00:00:00');

    useEffect(() => {
        const start = new Date(startedAt).getTime();

        const update = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((now - start) / 1000));

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            setDuration(
                `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);

    return (
        <Text style={{ fontVariant: ['tabular-nums'] }}>
            {duration}
        </Text>
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
        paddingBottom: 150, // Ensure space for bottom elements
        gap: spacing.md,
    },
    scrollContentWithTimer: {
        // paddingBottom is already handled by scrollContent, but we can add more if needed
        paddingBottom: 200,
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
        zIndex: 100, // Ensure it's above everything
    },
    addExerciseContainer: {
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
        gap: spacing.xs,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
