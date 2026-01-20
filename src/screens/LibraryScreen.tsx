/**
 * LibraryScreen - Библиотека упражнений
 * Connected to real database via useExercises hook
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Input, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { CategoryPill } from '@/components';
import { useExercises, useThemeColors, useWorkoutTemplates } from '@/hooks';
import { saveNewTemplate } from '@/services/workoutService';
import { triggerSelection, triggerImpact } from '@/utils/haptics';
import { colors, spacing, radius } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Exercise, WorkoutTemplate } from '@/types';

type RootStackParamList = {
    ActiveWorkout: { templateId?: string; exercises?: Exercise[] };
};

export function LibraryScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { exercises, muscleGroups, loading, error } = useExercises();
    const { templates, loading: templatesLoading, refetch: refetchTemplates } = useWorkoutTemplates(50); // Fetch more for library view
    const themeColors = useThemeColors();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

    // Save Modal State
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        surface: { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        textSecondary: { color: themeColors.textSecondary },
        exerciseIcon: { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        chevron: { color: themeColors.textMuted },
        floatingBar: { backgroundColor: themeColors.background, borderTopColor: themeColors.border },
        modalOverlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
        modalContent: { backgroundColor: themeColors.surface },
    }), [themeColors]);

    // My Templates (User created only)
    // Assuming useWorkoutTemplates returns both system and user, we filter for local display if needed.
    // However, the service `getWorkoutTemplates` returns everything. 
    // Let's rely on the `is_system` flag to distinguish "My Templates".
    const myTemplates = useMemo(() => {
        return templates.filter(t => !t.is_system);
    }, [templates]);

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

    const commonlyUsed = filteredExercises.slice(0, 2);

    // Toggle Selection Mode
    const toggleSelectionMode = () => {
        triggerSelection();
        if (isSelectionMode) {
            // Exit mode
            setIsSelectionMode(false);
            setSelectedExercises([]);
        } else {
            // Enter mode
            setIsSelectionMode(true);
        }
    };

    // Handle Exercise Selection
    const toggleExerciseSelection = (exercise: Exercise) => {
        triggerSelection();
        setSelectedExercises(prev => {
            const exists = prev.find(e => e.id === exercise.id);
            if (exists) {
                return prev.filter(e => e.id !== exercise.id);
            }
            return [...prev, exercise];
        });
    };

    const isSelected = (id: string) => !!selectedExercises.find(e => e.id === id);

    // Save Template Handler
    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) {
            Alert.alert('Error', 'Please enter a template name');
            return;
        }

        try {
            setIsSaving(true);
            const exercisesToSave = selectedExercises.map((ex, index) => ({
                exercise_id: ex.id,
                sort_order: index,
                // Default values
                target_sets: 3,
                rest_seconds: 90
            }));

            await saveNewTemplate(newTemplateName, exercisesToSave);

            triggerImpact('heavy');
            await refetchTemplates(); // Refresh the list

            // Reset UI
            setIsSaving(false);
            setIsSaveModalVisible(false);
            setNewTemplateName('');
            setIsSelectionMode(false);
            setSelectedExercises([]);

            Alert.alert('Success', 'Template saved!');
        } catch (err) {
            console.error(err);
            setIsSaving(false);
            Alert.alert('Error', 'Failed to save template');
        }
    };

    const renderExerciseCard = (exercise: Exercise, highlighted = false) => {
        const selected = isSelected(exercise.id);

        return (
            <GlassCard
                key={exercise.id}
                style={[
                    styles.exerciseCard,
                    isSelectionMode && selected ? styles.exerciseCardSelected : undefined
                ]}
                onPress={() => {
                    if (isSelectionMode) {
                        toggleExerciseSelection(exercise);
                    } else {
                        triggerSelection();
                        console.log('Selected:', exercise.name);
                        // Future: Go to exercise details
                    }
                }}
            >
                <View style={[
                    styles.exerciseIcon,
                    dynamicStyles.exerciseIcon,
                    highlighted && styles.exerciseIconHighlighted,
                    isSelectionMode && selected && styles.exerciseIconSelected
                ]}>
                    <Text style={styles.exerciseEmoji}>{getExerciseEmoji(exercise.icon)}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                    <Heading level={3}>{exercise.name}</Heading>
                    <UIText variant="body-sm" muted>
                        {exercise.muscle_group?.name || 'Unknown'} • {exercise.exercise_type}
                    </UIText>
                </View>

                {isSelectionMode ? (
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <Text style={styles.checkmarkText}>✓</Text>}
                    </View>
                ) : (
                    <Text style={[styles.chevron, dynamicStyles.chevron]}>›</Text>
                )}
            </GlassCard>
        );
    };

    const getExerciseEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '🏋️',
            sports_gymnastics: '💪',
            accessibility_new: '🧘',
            directions_run: '🏃',
        };
        return iconMap[icon] || '🏋️';
    };

    const getTemplateEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '📋', // Default for custom
        };
        return iconMap[icon] || '📋';
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <Heading level={1}>
                            {isSelectionMode ? 'Select Exercises' : <><Text style={styles.accentText}>Library</Text></>}
                        </Heading>
                    </View>
                    <Button
                        variant={isSelectionMode ? "secondary" : "icon"}
                        size="sm"
                        style={isSelectionMode ? styles.cancelButton : styles.addButton}
                        onPress={toggleSelectionMode}
                        testID="toggle-selection-button"
                    >
                        {isSelectionMode ? (
                            <UIText variant="body-sm" style={{ color: colors.error }}>Cancel</UIText>
                        ) : (
                            <Text style={styles.addIcon}>+</Text>
                        )}
                    </Button>
                </View>

                {/* Search Input */}
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
                    style={styles.categoryPillsContainer}
                    contentContainerStyle={styles.categoryPills}
                >
                    <CategoryPill
                        label="All"
                        active={selectedMuscleGroupId === null}
                        onPress={() => {
                            triggerSelection();
                            setSelectedMuscleGroupId(null);
                        }}
                    />
                    {muscleGroups.map(group => (
                        <CategoryPill
                            key={group.id}
                            label={group.name}
                            active={selectedMuscleGroupId === group.id}
                            onPress={() => {
                                triggerSelection();
                                setSelectedMuscleGroupId(group.id);
                            }}
                        />
                    ))}
                </ScrollView>

                {/* My Templates Section (Only in normal mode and if exists) */}
                {!isSelectionMode && myTemplates.length > 0 && (
                    <View style={styles.section}>
                        <Label style={styles.sectionLabel}>My Templates</Label>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesList}>
                            {myTemplates.map(template => (
                                <GlassCard
                                    key={template.id}
                                    style={styles.templateCard}
                                    onPress={() => {
                                        triggerSelection();
                                        navigation.navigate('ActiveWorkout', { templateId: template.id });
                                    }}
                                >
                                    <Text style={styles.templateEmoji}>{getTemplateEmoji(template.icon)}</Text>
                                    <UIText variant="body-sm" numberOfLines={2} style={styles.templateName}>
                                        {template.name}
                                    </UIText>
                                </GlassCard>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Commonly Used Section (Hide in selection mode to avoid duplicates confusion or simplify) */}
                {!isSelectionMode && commonlyUsed.length > 0 && (
                    <View style={styles.section}>
                        <Label style={styles.sectionLabel}>Commonly Used</Label>
                        <View style={styles.exerciseList}>
                            {commonlyUsed.map(ex => renderExerciseCard(ex, true))}
                        </View>
                    </View>
                )}

                {/* A-Z Section */}
                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>
                        {isSelectionMode ? `All Exercises` : `A-Z (${filteredExercises.length})`}
                    </Label>
                    <View style={styles.exerciseList}>
                        {filteredExercises.map(ex => renderExerciseCard(ex, false))}
                    </View>
                </View>

                {/* Bottom Padding for Floating Bar */}
                {isSelectionMode && <View style={{ height: 100 }} />}
            </ScrollView>

            {/* Floating Save Bar */}
            {isSelectionMode && selectedExercises.length > 0 && (
                <View style={[styles.floatingBar, dynamicStyles.floatingBar]}>
                    <Button
                        variant="primary"
                        size="lg"
                        glow
                        onPress={() => {
                            triggerSelection();
                            setIsSaveModalVisible(true);
                        }}
                        style={styles.floatingButton}
                    >
                        {`Save New Template (${selectedExercises.length})`}
                    </Button>
                </View>
            )}

            {/* Save Template Modal */}
            <Modal
                transparent
                visible={isSaveModalVisible}
                animationType="fade"
                onRequestClose={() => setIsSaveModalVisible(false)}
            >
                <Pressable
                    style={[styles.modalOverlay, dynamicStyles.modalOverlay]}
                    onPress={() => setIsSaveModalVisible(false)}
                >
                    <Pressable style={[styles.modalContent, dynamicStyles.modalContent]} onPress={(e) => e.stopPropagation()}>
                        <Heading level={2} style={styles.modalTitle}>Save Template</Heading>
                        <UIText variant="body" muted style={styles.modalSubtitle}>
                            Create a new template with {selectedExercises.length} exercises.
                        </UIText>

                        <View style={styles.modalInputContainer}>
                            <Label>Template Name</Label>
                            <Input
                                placeholder="e.g., Leg Day Blaster"
                                value={newTemplateName}
                                onChangeText={setNewTemplateName}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <Button
                                variant="ghost"
                                onPress={() => setIsSaveModalVisible(false)}
                                style={styles.modalButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleSaveTemplate}
                                loading={isSaving}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerTitle: {
        flex: 1,
    },
    accentText: {
        color: colors.primary.DEFAULT,
    },
    addButton: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderColor: `${colors.primary.DEFAULT}33`,
    },
    cancelButton: {
        minWidth: 80,
    },
    addIcon: {
        fontSize: 24,
        color: colors.primary.DEFAULT,
    },

    // Search
    searchContainer: {
        marginBottom: spacing.md,
    },

    // Category Pills
    categoryPillsContainer: {
        marginHorizontal: -spacing.md,
        marginBottom: 0,
    },
    categoryPills: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },

    // Sections
    section: {
        marginTop: spacing.lg,
    },
    sectionLabel: {
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    exerciseList: {
        gap: spacing.md,
    },
    templatesList: {
        gap: spacing.md,
        paddingRight: spacing.md,
    },

    // Template Card
    templateCard: {
        width: 140,
        height: 120,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    templateEmoji: {
        fontSize: 32,
    },
    templateName: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },

    // Exercise Card
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    exerciseCardSelected: {
        borderColor: colors.primary.DEFAULT,
        borderWidth: 1,
        backgroundColor: `${colors.primary.DEFAULT}0A`,
    },
    exerciseIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIconHighlighted: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderColor: `${colors.primary.DEFAULT}33`,
    },
    exerciseIconSelected: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
    },
    exerciseEmoji: {
        fontSize: 28,
    },
    exerciseInfo: {
        flex: 1,
    },
    chevron: {
        fontSize: 24,
    },

    // Checkbox
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
    },
    checkmarkText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Floating Bar
    floatingBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: spacing.xl + 10, // Safe area
        borderTopWidth: 1,
    },
    floatingButton: {
        width: '100%',
    },

    // Modal
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
