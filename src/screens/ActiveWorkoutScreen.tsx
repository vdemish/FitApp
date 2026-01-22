/**
 * ActiveWorkoutScreen - Main screen for active workout session
 * Displays exercises, sets, and rest timer overlay
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ActiveExerciseCard, FocusRestTimer, AddExerciseModal } from '@/components';
import { Button, Heading, Input, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useActiveWorkout, useThemeColors, ActiveExercise, useWorkoutTimer } from '@/hooks';
import { triggerTimerTick, triggerSuccess, triggerSelection } from '@/utils/haptics';
import { colors, typography, spacing, radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { WorkoutTemplate } from '@/types';
import { getWorkoutTemplateById, saveNewTemplate, updateTemplateExercises } from '@/services/workoutService';

// Route params type
type ActiveWorkoutRouteProp = RouteProp<RootStackParamList, 'ActiveWorkout'>;
type ActiveWorkoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen() {
    const navigation = useNavigation<ActiveWorkoutNavigationProp>();
    const route = useRoute<ActiveWorkoutRouteProp>();
    const themeColors = useThemeColors();
    const [isAddExerciseModalVisible, setAddExerciseModalVisible] = React.useState(false);
    const [templateInfo, setTemplateInfo] = React.useState<WorkoutTemplate | null>(null);
    const [isSaveTemplateModalVisible, setIsSaveTemplateModalVisible] = React.useState(false);
    const [templateName, setTemplateName] = React.useState('');
    const [templateNameDefault, setTemplateNameDefault] = React.useState('');
    const [isTemplateNameOptional, setIsTemplateNameOptional] = React.useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = React.useState(false);
    const [pendingExitAction, setPendingExitAction] = React.useState<'finish' | 'cancel' | null>(null);

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
            modalOverlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
            modalContent: { backgroundColor: themeColors.surface },
        }),
        [themeColors]
    );

    useEffect(() => {
        const fetchTemplateInfo = async () => {
            if (!workout?.template_id) {
                setTemplateInfo(null);
                return;
            }

            const template = await getWorkoutTemplateById(workout.template_id);
            setTemplateInfo(template);
        };

        fetchTemplateInfo();
    }, [workout?.template_id]);

    const buildTemplateExercises = useCallback(() => {
        if (!workout?.exercises?.length) return [];

        const sortedExercises = [...workout.exercises].sort((a, b) => a.sort_order - b.sort_order);
        return sortedExercises.map((exercise, index) => ({
            exercise_id: exercise.exercise_id,
            sort_order: Number.isFinite(exercise.sort_order) ? exercise.sort_order : index,
            target_sets: exercise.sets?.length || 1,
            rest_seconds: exercise.rest_seconds || 90,
        }));
    }, [workout]);

    const hasTemplateChanges = useMemo(() => {
        if (!templateInfo || !workout?.exercises) return false;

        const templateExercises = [...(templateInfo.exercises || [])].sort(
            (a, b) => a.sort_order - b.sort_order
        );
        const workoutExercises = [...workout.exercises].sort(
            (a, b) => a.sort_order - b.sort_order
        );

        if (templateExercises.length !== workoutExercises.length) return true;

        for (let i = 0; i < templateExercises.length; i += 1) {
            const templateExercise = templateExercises[i];
            const workoutExercise = workoutExercises[i];
            const templateSets = templateExercise.target_sets ?? 1;
            const workoutSets = workoutExercise.sets?.length || 0;
            const templateRest = templateExercise.rest_seconds ?? 90;
            const workoutRest = workoutExercise.rest_seconds ?? 90;

            if (templateExercise.exercise_id !== workoutExercise.exercise_id) return true;
            if (templateExercise.sort_order !== workoutExercise.sort_order) return true;
            if (templateSets !== workoutSets) return true;
            if (templateRest !== workoutRest) return true;
        }

        return false;
    }, [templateInfo, workout?.exercises]);

    const performExit = useCallback(
        async (action: 'finish' | 'cancel') => {
            if (action === 'finish') {
                await actions.finishWorkout();
            } else {
                await actions.cancelWorkout();
            }
            navigation.goBack();
        },
        [actions, navigation]
    );

    const saveTemplateAndExit = useCallback(
        async (action: 'finish' | 'cancel', nameOverride?: string) => {
            if (!workout) return;

            const exercisesToSave = buildTemplateExercises();
            const templateNameToUse = nameOverride || templateInfo?.name || 'New Template';

            try {
                setIsSavingTemplate(true);
                if (!templateInfo || templateInfo.is_system) {
                    await saveNewTemplate(templateNameToUse, exercisesToSave);
                } else {
                    await updateTemplateExercises(templateInfo.id, exercisesToSave);
                }

                setIsSaveTemplateModalVisible(false);
                setTemplateName('');
                setTemplateNameDefault('');
                setIsTemplateNameOptional(false);
                setPendingExitAction(null);
                await performExit(action);
            } catch (err) {
                console.error('[ActiveWorkoutScreen] Failed to save template:', err);
                Alert.alert('Error', 'Failed to save template');
            } finally {
                setIsSavingTemplate(false);
            }
        },
        [workout, templateInfo, buildTemplateExercises, performExit]
    );

    const handleSavePrompt = useCallback(
        (action: 'finish' | 'cancel') => {
            if (templateInfo && !hasTemplateChanges) {
                performExit(action);
                return;
            }

            Alert.alert(
                'Save Template',
                templateInfo
                    ? `Do you want to save changes to template ${templateInfo.name}?`
                    : 'Do you want to save a template?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'No',
                        style: 'destructive',
                        onPress: () => {
                            performExit(action);
                        },
                    },
                    {
                        text: 'Yes',
                        onPress: () => {
                            if (!templateInfo) {
                                setPendingExitAction(action);
                                setTemplateName('');
                                setTemplateNameDefault('');
                                setIsTemplateNameOptional(false);
                                setIsSaveTemplateModalVisible(true);
                                return;
                            }

                            if (templateInfo.is_system) {
                                const defaultName = `My ${templateInfo.name}`;
                                setPendingExitAction(action);
                                setTemplateName(defaultName);
                                setTemplateNameDefault(defaultName);
                                setIsTemplateNameOptional(true);
                                setIsSaveTemplateModalVisible(true);
                                return;
                            }

                            saveTemplateAndExit(action);
                        },
                    },
                ]
            );
        },
        [templateInfo, hasTemplateChanges, performExit, saveTemplateAndExit]
    );

    // Handle cancel workout
    const handleCancel = useCallback(() => {
        handleSavePrompt('cancel');
    }, [handleSavePrompt]);

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

        handleSavePrompt('finish');
    }, [exercises, handleSavePrompt]);

    // Calculate active exercise ID (first exercise with incomplete sets)
    const activeExerciseId = useMemo(() => {
        return exercises.find(ex => ex.sets.some(s => !s.isCompleted))?.id;
    }, [exercises]);

    // Handle set change (weight, reps, distance, or duration)
    const handleSetChange = useCallback(
        (setId: string, field: 'weight' | 'reps' | 'distance' | 'durationSeconds', value: number) => {
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

    const handleRemoveSet = useCallback(
        (setId: string) => {
            actions.removeSet(setId);
        },
        [actions]
    );

    // Timer Logic using the new hook
    const { remainingTime } = useWorkoutTimer({
        isActive: timerState.isActive,
        duration: timerState.restSeconds,
        startTime: timerState.lastCompletedSetTimestamp,
        onComplete: actions.dismissTimer,
        label: 'Rest',
    });

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
                    </View>
                ) : (
                    <DraggableFlatList
                        data={exercises}
                        onDragEnd={({ data }) => actions.reorderExercises(data)}
                        keyExtractor={(item) => item.workoutExerciseId}
                        renderItem={({ item, drag, isActive }: RenderItemParams<ActiveExercise>) => (
                            <ScaleDecorator>
                                <Pressable
                                    onLongPress={drag}
                                    disabled={isActive}
                                    style={{
                                        marginBottom: spacing.md,
                                        opacity: isActive ? 0.8 : 1,
                                    }}
                                >
                                    <ActiveExerciseCard
                                        exerciseName={item.name}
                                        trackingType={item.trackingType}
                                        sets={item.sets}
                                        onAddSet={() => handleAddSet(item.workoutExerciseId)}
                                        onRemoveSet={handleRemoveSet}
                                        onSetChange={(setId, field, value) =>
                                            handleSetChange(setId, field, value)
                                        }
                                        onToggleComplete={(setId) => handleToggleComplete(setId)}
                                        onAutoFill={actions.autoFillSets}
                                        onMenuPress={() => {
                                            console.log('Menu pressed for:', item.name);
                                        }}
                                        testID={`exercise-card-${item.id}`}
                                        isResting={timerState.isActive}
                                        isActiveExercise={item.id === activeExerciseId}
                                    />
                                </Pressable>
                            </ScaleDecorator>
                        )}
                        contentContainerStyle={[
                            styles.scrollContent,
                            timerState.isActive && styles.scrollContentWithTimer,
                        ]}
                        ListFooterComponent={
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
                        }
                    />
                )}
            </KeyboardAvoidingView>

            {/* Focus Rest Timer Overlay */}
            <FocusRestTimer
                isVisible={timerState.isActive}
                secondsRemaining={remainingTime}
                onAddSeconds={(secs) => actions.addRestTime(secs)}
                onClose={actions.dismissTimer}
            />

            <AddExerciseModal
                visible={isAddExerciseModalVisible}
                onClose={() => setAddExerciseModalVisible(false)}
                onAdd={actions.addExercises}
            />

            <Modal
                transparent
                visible={isSaveTemplateModalVisible}
                animationType="fade"
                onRequestClose={() => setIsSaveTemplateModalVisible(false)}
            >
                <Pressable
                    style={[styles.modalOverlay, dynamicStyles.modalOverlay]}
                    onPress={() => setIsSaveTemplateModalVisible(false)}
                >
                    <Pressable
                        style={[styles.modalContent, dynamicStyles.modalContent]}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Heading level={2} style={styles.modalTitle}>Save Template</Heading>
                        <UIText variant="body" muted style={styles.modalSubtitle}>
                            {isTemplateNameOptional ? 'Choose a name for your copy' : 'Name your new template'}
                        </UIText>

                        <View style={styles.modalInputContainer}>
                            <Label>Template Name</Label>
                            <Input
                                placeholder="e.g., Leg Day Blaster"
                                value={templateName}
                                onChangeText={setTemplateName}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <Button
                                variant="ghost"
                                onPress={() => {
                                    setIsSaveTemplateModalVisible(false);
                                    setTemplateNameDefault('');
                                    setIsTemplateNameOptional(false);
                                    setPendingExitAction(null);
                                }}
                                style={styles.modalButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={() => {
                                    const trimmedName = templateName.trim();
                                    if (!trimmedName && !isTemplateNameOptional) {
                                        Alert.alert('Error', 'Please enter a template name');
                                        return;
                                    }
                                    if (!pendingExitAction) return;
                                    const resolvedName = trimmedName || templateNameDefault;
                                    saveTemplateAndExit(pendingExitAction, resolvedName);
                                }}
                                loading={isSavingTemplate}
                                style={styles.modalButton}
                            >
                                Save
                            </Button>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
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
    // scrollView removed
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: radius.xl,
        padding: spacing.xl,
        gap: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 5,
    },
    modalTitle: {
        textAlign: 'center',
    },
    modalSubtitle: {
        textAlign: 'center',
    },
    modalInputContainer: {
        gap: spacing.xs,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'flex-end',
    },
    modalButton: {
        flex: 1,
    },
});
