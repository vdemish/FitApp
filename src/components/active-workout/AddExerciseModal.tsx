/**
 * AddExerciseModal - Modal for adding exercises to the active workout
 * Adapted from StartWorkoutModal exercise selection logic
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
    TextInput,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { CategoryPill } from '@/components/CategoryPill';
import { useExercises, useThemeColors } from '@/hooks';
import { getExerciseIconSource } from '@/utils/exerciseIcons';
import { colors, typography, spacing, radius } from '@/theme';
import type { Exercise } from '@/types';

interface AddExerciseModalProps {
    visible: boolean;
    onClose: () => void;
    /** Called when user wants to add selected exercises */
    onAdd: (exerciseIds: string[]) => void;
}

export function AddExerciseModal({ visible, onClose, onAdd }: AddExerciseModalProps) {
    const themeColors = useThemeColors();
    const { exercises, muscleGroups, loading: exercisesLoading } = useExercises();

    const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);

    // Dynamic styles
    const dynamicStyles = useMemo(
        () => ({
            container: { backgroundColor: themeColors.background },
            handleBar: { backgroundColor: themeColors.textMuted },
            header: { borderBottomColor: themeColors.border },
            closeButton: { backgroundColor: themeColors.surface },
            closeIcon: { color: themeColors.textSecondary },
            exerciseIcon: {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
            },
            searchContainer: {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
            },
            searchInput: {
                color: themeColors.textPrimary,
            },
            floatingButtonContainer: {
                backgroundColor: themeColors.background,
                borderTopColor: themeColors.border,
            },
        }),
        [themeColors]
    );

    // Filter exercises
    const filteredExercises = useMemo(() => {
        let result = exercises;

        if (selectedMuscleGroupId) {
            result = result.filter((e) => e.muscle_group_id === selectedMuscleGroupId);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (e) =>
                    e.name.toLowerCase().includes(query) ||
                    e.muscle_group?.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [exercises, searchQuery, selectedMuscleGroupId]);

    // Toggle exercise selection
    const toggleExerciseSelection = useCallback((exerciseId: string) => {
        setSelectedExerciseIds((prev) => {
            const isSelected = prev.includes(exerciseId);
            if (isSelected) {
                return prev.filter((id) => id !== exerciseId);
            } else {
                return [...prev, exerciseId];
            }
        });
    }, []);

    // Handle add
    const handleAdd = () => {
        onAdd(selectedExerciseIds);
        // Reset selection after adding (optional, depending on UX preference)
        setSelectedExerciseIds([]);
        onClose();
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
                        <Heading level={2}>Add Exercises</Heading>
                        <Pressable
                            onPress={onClose}
                            style={[styles.closeButton, dynamicStyles.closeButton]}
                        >
                            <Text style={[styles.closeIcon, dynamicStyles.closeIcon]}>✕</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Search & Filters */}
                <View style={styles.filterSection}>
                    {/* Search */}
                    <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
                        <Ionicons name="search" size={20} color={themeColors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, dynamicStyles.searchInput]}
                            placeholder="Search exercises..."
                            placeholderTextColor={themeColors.textMuted}
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
                            onPress={() => setSelectedMuscleGroupId(null)}
                        />
                        {muscleGroups.map((group) => (
                            <CategoryPill
                                key={group.id}
                                label={group.name}
                                active={selectedMuscleGroupId === group.id}
                                onPress={() => setSelectedMuscleGroupId(group.id)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Exercise List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {exercisesLoading ? (
                        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                    ) : (
                        <View style={styles.exerciseList}>
                            {filteredExercises.map((exercise) => {
                                const selected = selectedExerciseIds.includes(exercise.id);
                                return (
                                    <GlassCard
                                        key={exercise.id}
                                        style={{
                                            ...styles.exerciseCard,
                                            ...(selected ? styles.exerciseCardSelected : {}),
                                        }}
                                        onPress={() => toggleExerciseSelection(exercise.id)}
                                    >
                                        <View
                                            style={[
                                                styles.exerciseIcon,
                                                dynamicStyles.exerciseIcon,
                                                selected && styles.exerciseIconSelected,
                                            ]}
                                        >
                                            <Image source={getExerciseIconSource(exercise.icon)} style={styles.exerciseIconImage} />
                                        </View>
                                        <View style={styles.exerciseInfo}>
                                            <Heading level={3}>{exercise.name}</Heading>
                                            <UIText variant="body-sm" muted>
                                                {exercise.muscle_group?.name || 'Unknown'}
                                            </UIText>
                                        </View>
                                        {selected && (
                                            <View style={styles.checkmark}>
                                                <Text style={styles.checkmarkText}>✓</Text>
                                            </View>
                                        )}
                                    </GlassCard>
                                );
                            })}
                        </View>
                    )}

                    {/* Bottom padding for floating button */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Floating Add Button */}
                {selectedExerciseIds.length > 0 && (
                    <View
                        style={[
                            styles.floatingButtonContainer,
                            dynamicStyles.floatingButtonContainer,
                        ]}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            glow
                            onPress={handleAdd}
                            style={styles.floatingButton}
                        >
                            {`Add ${selectedExerciseIds.length} Exercise${selectedExerciseIds.length !== 1 ? 's' : ''
                                }`}
                        </Button>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
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
    },
    closeIcon: {
        fontSize: 16,
    },

    // Filter Section
    filterSection: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.body,
    },
    categoryContainer: {
        marginHorizontal: -spacing.md,
    },
    categoryContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },

    // Scroll Content
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
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
    },
    exerciseIconSelected: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderColor: colors.primary.DEFAULT,
    },
    exerciseIconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    exerciseInfo: {
        flex: 1,
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
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
    },
    floatingButton: {
        width: '100%',
    },
});
