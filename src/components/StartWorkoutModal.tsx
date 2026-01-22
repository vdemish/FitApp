/**
 * StartWorkoutModal - Modal for starting a new workout
 * Contains three sections: History, Templates, and Exercise Selection
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Heading, Label, Input } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { CategoryPill } from '@/components/CategoryPill';
import { useWorkoutHistory, useWorkoutTemplates, useExercises, useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';
import { colors, typography, spacing, radius } from '@/theme';
import type { Exercise, Workout, WorkoutTemplate, SelectedExercise } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_SETS = 1;
const MAX_SETS = 19;

interface StartWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
    /** Called when user wants to start a workout */
    onStartWorkout?: (params: { templateId?: string; workoutId?: string; exercises?: SelectedExercise[] }) => void;
}

export function StartWorkoutModal({ visible, onClose, onStartWorkout }: StartWorkoutModalProps) {
    const themeColors = useThemeColors();
    const { workouts: historyWorkouts, loading: historyLoading } = useWorkoutHistory(2);
    const { templates, loading: templatesLoading, refetch: refetchTemplates } = useWorkoutTemplates(50); // Fetch more templates for scrolling
    const { exercises, muscleGroups, loading: exercisesLoading } = useExercises();

    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);
    const selectedExercisesById = useMemo(
        () => new Map(selectedExercises.map(exercise => [exercise.id, exercise])),
        [selectedExercises]
    );

    // Refetch data when modal opens
    React.useEffect(() => {
        if (visible) {
            refetchTemplates();
        }
    }, [visible, refetchTemplates]);

    // Dynamic styles
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        handleBar: { backgroundColor: themeColors.textMuted },
        header: { borderBottomColor: themeColors.border },
        closeButton: { backgroundColor: themeColors.surface },
        closeIcon: { color: themeColors.textSecondary },
        exerciseIcon: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
        },
        setButton: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        setButtonText: {
            color: themeColors.textPrimary,
        },
        setCountText: {
            color: themeColors.textPrimary,
        },
        setLabelText: {
            color: themeColors.textMuted,
        },
        floatingButtonContainer: {
            backgroundColor: themeColors.background,
            borderTopColor: themeColors.border
        },
    }), [themeColors]);

    // Filter exercises
    const filteredExercises = useMemo(() => {
        let result = exercises;

        if (selectedMuscleGroupId) {
            result = result.filter(e => e.muscle_group_id === selectedMuscleGroupId);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.muscle_group?.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [exercises, searchQuery, selectedMuscleGroupId]);

    // Toggle exercise selection
    const clampSets = useCallback(
        (value: number) => Math.min(MAX_SETS, Math.max(MIN_SETS, value)),
        []
    );

    const toggleExerciseSelection = useCallback((exercise: Exercise) => {
        setSelectedExercises(prev => {
            const isSelected = prev.some(e => e.id === exercise.id);
            if (isSelected) {
                return prev.filter(e => e.id !== exercise.id);
            }
            return [...prev, { ...exercise, target_sets: MIN_SETS }];
        });
    }, []);

    const updateExerciseSets = useCallback((exerciseId: string, delta: number) => {
        setSelectedExercises(prev =>
            prev.map(exercise =>
                exercise.id === exerciseId
                    ? { ...exercise, target_sets: clampSets((exercise.target_sets ?? MIN_SETS) + delta) }
                    : exercise
            )
        );
    }, [clampSets]);

    // Handle start from history
    const handleStartFromHistory = (workout: Workout) => {
        console.log('[StartWorkoutModal] Starting from history:', workout.name);
        onClose();
        // Use template_id from the completed workout to create a new workout
        onStartWorkout?.({ templateId: workout.template_id || undefined });
    };

    // Handle start from template
    const handleStartFromTemplate = (template: WorkoutTemplate) => {
        console.log('[StartWorkoutModal] Starting from template:', template.name);
        onClose();
        onStartWorkout?.({ templateId: template.id });
    };

    // Handle start with selected exercises
    const handleStartWithExercises = () => {
        console.log('[StartWorkoutModal] Starting with exercises:', selectedExercises.map(e => e.name));
        onClose();
        onStartWorkout?.({ exercises: selectedExercises });
    };

    // Get exercise emoji
    const getExerciseEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '🏋️',
            sports_gymnastics: '💪',
            accessibility_new: '🧘',
            directions_run: '🏃',
        };
        return iconMap[icon] || '🏋️';
    };

    // Get template emoji
    const getTemplateEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '🏋️',
            sports_martial_arts: '🥊',
            self_improvement: '🧘',
            directions_run: '🏃',
            accessibility_new: '💪',
        };
        return iconMap[icon] || '📋';
    };

    // Format date for history cards
    const formatWorkoutDate = (dateString: string | null): string => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en', { month: 'short' });
        const weekday = date.toLocaleString('en', { weekday: 'long' });
        return `${day} ${month}, ${weekday}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, dynamicStyles.header]}>
                    <View style={[styles.handleBar, dynamicStyles.handleBar]} />
                    <View style={styles.headerContent}>
                        <Heading level={2}>Start Workout</Heading>
                        <Pressable onPress={() => { triggerSelection(); onClose(); }} style={[styles.closeButton, dynamicStyles.closeButton]}>
                            <Text style={[styles.closeIcon, dynamicStyles.closeIcon]}>✕</Text>
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Section A: Your History */}
                    {!historyLoading && historyWorkouts.length > 0 && (
                        <View style={styles.section}>
                            <Label style={styles.sectionLabel}>Your History</Label>
                            <View style={styles.historyGrid}>
                                {historyWorkouts.slice(0, 2).map((workout) => (
                                    <GlassCard
                                        key={workout.id}
                                        style={styles.historyCard}
                                        onPress={() => handleStartFromHistory(workout)}
                                        onPressIn={() => triggerSelection()}
                                    >
                                        <Text style={styles.historyEmoji}>📊</Text>
                                        <Heading level={3} style={styles.historyTitle}>{workout.name}</Heading>
                                        <UIText variant="caption" muted>{formatWorkoutDate(workout.completed_at)}</UIText>
                                        <UIText variant="caption" muted>{workout.exercises?.length || 0} exercises</UIText>
                                    </GlassCard>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Section B: Start from Template */}
                    <View style={styles.section}>
                        <Label style={styles.sectionLabel}>Start from Template</Label>
                        {templatesLoading ? (
                            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                        ) : templates.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.templateScrollContent}
                            >
                                {templates.map((template) => (
                                    <GlassCard
                                        key={template.id}
                                        style={styles.templateCard}
                                        onPress={() => handleStartFromTemplate(template)}
                                        onPressIn={() => triggerSelection()}
                                    >
                                        <Text style={styles.templateEmoji}>{getTemplateEmoji(template.icon)}</Text>
                                        <UIText variant="body-sm" style={styles.templateName} numberOfLines={2}>
                                            {template.name}
                                        </UIText>
                                    </GlassCard>
                                ))}
                            </ScrollView>
                        ) : (
                            <GlassCard style={styles.emptyCard}>
                                <UIText variant="body-sm" muted>No templates available</UIText>
                            </GlassCard>
                        )}
                    </View>

                    {/* Section C: Start Empty Workout (Exercise Selection) */}
                    <View style={styles.section}>
                        <Label style={styles.sectionLabel}>
                            {`Select Exercises${selectedExercises.length > 0 ? ` (${selectedExercises.length})` : ''}`}
                        </Label>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Input
                                icon="search"
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Category Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryContainer}
                            contentContainerStyle={styles.categoryContent}
                        >
                            <CategoryPill
                                label="All"
                                active={selectedMuscleGroupId === null}
                                onPress={() => { triggerSelection(); setSelectedMuscleGroupId(null); }}
                            />
                            {muscleGroups.map(group => (
                                <CategoryPill
                                    key={group.id}
                                    label={group.name}
                                    active={selectedMuscleGroupId === group.id}
                                    onPress={() => { triggerSelection(); setSelectedMuscleGroupId(group.id); }}
                                />
                            ))}
                        </ScrollView>

                        {/* Exercise List */}
                        {exercisesLoading ? (
                            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                        ) : (
                            <View style={styles.exerciseList}>
                                {filteredExercises.map((exercise) => {
                                    const selectedExercise = selectedExercisesById.get(exercise.id);
                                    const selected = !!selectedExercise;
                                    const setCount = selectedExercise?.target_sets ?? MIN_SETS;
                                    return (
                                        <GlassCard
                                            key={exercise.id}
                                            style={{
                                                ...styles.exerciseCard,
                                                ...(selected ? styles.exerciseCardSelected : {}),
                                            }}
                                            onPress={() => toggleExerciseSelection(exercise)}
                                            onPressIn={() => triggerSelection()}
                                        >
                                            <View style={[
                                                styles.exerciseIcon,
                                                dynamicStyles.exerciseIcon,
                                                selected && styles.exerciseIconSelected,
                                            ]}>
                                                <Text style={styles.exerciseEmoji}>{getExerciseEmoji(exercise.icon)}</Text>
                                            </View>
                                            <View style={styles.exerciseInfo}>
                                                <Heading level={3} style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail">
                                                    {exercise.name}
                                                </Heading>
                                                <UIText variant="body-sm" muted>{exercise.muscle_group?.name || 'Unknown'}</UIText>
                                            </View>
                                            {selected && (
                                                <View style={styles.setsControl}>
                                                    <UIText variant="caption" style={[styles.setsLabel, dynamicStyles.setLabelText]}>
                                                        Sets
                                                    </UIText>
                                                    <View style={styles.setsStepper}>
                                                        <Pressable
                                                            onPress={(event) => {
                                                                event.stopPropagation();
                                                                triggerSelection();
                                                                updateExerciseSets(exercise.id, -1);
                                                            }}
                                                            disabled={setCount <= MIN_SETS}
                                                            style={[
                                                                styles.setButton,
                                                                dynamicStyles.setButton,
                                                                setCount <= MIN_SETS && styles.setButtonDisabled,
                                                            ]}
                                                        >
                                                            <Text style={[styles.setButtonText, dynamicStyles.setButtonText]}>-</Text>
                                                        </Pressable>
                                                        <Text style={[styles.setCountText, dynamicStyles.setCountText]}>
                                                            {setCount}
                                                        </Text>
                                                        <Pressable
                                                            onPress={(event) => {
                                                                event.stopPropagation();
                                                                triggerSelection();
                                                                updateExerciseSets(exercise.id, 1);
                                                            }}
                                                            disabled={setCount >= MAX_SETS}
                                                            style={[
                                                                styles.setButton,
                                                                dynamicStyles.setButton,
                                                                setCount >= MAX_SETS && styles.setButtonDisabled,
                                                            ]}
                                                        >
                                                            <Text style={[styles.setButtonText, dynamicStyles.setButtonText]}>+</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            )}
                                        </GlassCard>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Bottom padding for floating button */}
                    <View style={{ height: 100 }} />
                </ScrollView >

                {/* Floating Start Button */}
                {
                    selectedExercises.length > 0 && (
                        <View style={[styles.floatingButtonContainer, dynamicStyles.floatingButtonContainer]}>
                            <Button
                                variant="primary"
                                size="lg"
                                glow
                                onPress={() => { triggerSelection(); handleStartWithExercises(); }}
                                style={styles.floatingButton}
                            >
                                {`START (${selectedExercises.length} exercises)`}
                            </Button>
                        </View>
                    )
                }
            </SafeAreaView >
        </Modal >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        // color set dynamically
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // color set dynamically
    },
    closeIcon: {
        fontSize: 16,
        // color set dynamically
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },

    // Sections
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        marginBottom: spacing.md,
    },

    // History Grid (2 columns)
    historyGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    historyCard: {
        flex: 1,
        padding: spacing.lg,
        alignItems: 'center',
    },
    historyEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    historyTitle: {
        textAlign: 'center',
        marginBottom: spacing.xs,
    },

    // Template Grid (horizontal scroll)
    templateScrollContent: {
        paddingHorizontal: spacing.xs, // Adjusted for scroll
        gap: spacing.sm,
    },
    templateCard: {
        width: 140, // Fixed width for horizontal items
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
    },
    templateEmoji: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    templateName: {
        textAlign: 'center',
        fontSize: 12,
    },
    emptyCard: {
        padding: spacing.lg,
        alignItems: 'center',
    },

    // Search
    searchContainer: {
        marginBottom: spacing.md,
    },
    categoryContainer: {
        marginBottom: spacing.md,
        marginHorizontal: -spacing.md,
    },
    categoryContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },

    // Exercise List
    exerciseList: {
        gap: spacing.md,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    exerciseCardSelected: {
        borderColor: colors.primary.DEFAULT,
        borderWidth: 2,
    },
    exerciseIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // colors set dynamically
    },
    exerciseIconSelected: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderColor: colors.primary.DEFAULT,
    },
    exerciseEmoji: {
        fontSize: 24,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        lineHeight: 20,
    },
    setsControl: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    setsLabel: {
        fontSize: 12,
    },
    setsStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    setButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setButtonDisabled: {
        opacity: 0.4,
    },
    setButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    setCountText: {
        minWidth: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },

    // Floating Button
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        // colors set dynamically
    },
    floatingButton: {
        width: '100%',
    },
});
