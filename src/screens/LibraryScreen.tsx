/**
 * LibraryScreen - Библиотека упражнений
 * Connected to real database via useExercises hook
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Input, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { CategoryPill } from '@/components';
import { useExercises, useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';
import { colors, typography, spacing, radius } from '@/theme';
import type { Exercise, MuscleGroup } from '@/types';

export function LibraryScreen() {
    const { exercises, muscleGroups, loading, error } = useExercises();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);
    const themeColors = useThemeColors();

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        surface: { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        textMuted: { color: themeColors.textMuted },
        exerciseIcon: { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        chevron: { color: themeColors.textMuted },
    }), [themeColors]);

    // Фильтрация упражнений
    const filteredExercises = useMemo(() => {
        let result = exercises;

        // Фильтр по группе мышц
        if (selectedMuscleGroupId) {
            result = result.filter(e => e.muscle_group_id === selectedMuscleGroupId);
        }

        // Фильтр по поиску
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.muscle_group?.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [exercises, searchQuery, selectedMuscleGroupId]);

    // Часто используемые (первые 2)
    const commonlyUsed = filteredExercises.slice(0, 2);

    const renderExerciseCard = (exercise: Exercise, highlighted = false) => (
        <GlassCard
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => {
                triggerSelection();
                console.log('Selected:', exercise.name);
            }}
        >
            <View style={[styles.exerciseIcon, dynamicStyles.exerciseIcon, highlighted && styles.exerciseIconHighlighted]}>
                <Text style={styles.exerciseEmoji}>{getExerciseEmoji(exercise.icon)}</Text>
            </View>
            <View style={styles.exerciseInfo}>
                <Heading level={3}>{exercise.name}</Heading>
                <UIText variant="body-sm" muted>
                    {exercise.muscle_group?.name || 'Unknown'} • {exercise.exercise_type}
                </UIText>
            </View>
            <Text style={[styles.chevron, dynamicStyles.chevron]}>›</Text>
        </GlassCard>
    );

    // Простой маппинг иконок в emoji
    const getExerciseEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '🏋️',
            sports_gymnastics: '💪',
            accessibility_new: '🧘',
            directions_run: '🏃',
        };
        return iconMap[icon] || '🏋️';
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    <UIText variant="body-sm" muted style={styles.loadingText}>
                        Загрузка упражнений...
                    </UIText>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <UIText variant="body" muted>{error}</UIText>
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
                            Exercise <Text style={styles.accentText}>Library</Text>
                        </Heading>
                    </View>
                    <Button
                        variant="icon"
                        size="sm"
                        style={styles.addButton}
                        onPress={() => {
                            triggerSelection();
                            console.log('Add exercise');
                        }}
                        testID="add-exercise-button"
                    >
                        <Text style={styles.addIcon}>+</Text>
                    </Button>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <Input
                        icon="search"
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        testID="search-input"
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
                        testID="category-all"
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
                            testID={`category-${group.name.toLowerCase().replace(/\s/g, '-')}`}
                        />
                    ))}
                </ScrollView>

                {/* Commonly Used Section */}
                {commonlyUsed.length > 0 && (
                    <View style={styles.section}>
                        <Label style={styles.sectionLabel}>Commonly Used</Label>
                        <View style={styles.exerciseList}>
                            {commonlyUsed.map(ex => renderExerciseCard(ex, true))}
                        </View>
                    </View>
                )}

                {/* A-Z Section */}
                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>A-Z ({filteredExercises.length})</Label>
                    <View style={styles.exerciseList}>
                        {filteredExercises.map(ex => renderExerciseCard(ex, false))}
                    </View>
                </View>

                {/* Empty State */}
                {filteredExercises.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <UIText variant="body" muted>No exercises found</UIText>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor is set dynamically via dynamicStyles.container
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
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
        marginHorizontal: -spacing.md, // Extend beyond parent padding
    },
    categoryPills: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md, // Add padding inside content
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

    // Exercise Card
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    exerciseIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.lg,
        // backgroundColor and borderColor are set dynamically via dynamicStyles.exerciseIcon
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIconHighlighted: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        borderColor: `${colors.primary.DEFAULT}33`,
    },
    exerciseEmoji: {
        fontSize: 28,
    },
    exerciseInfo: {
        flex: 1,
    },
    chevron: {
        fontSize: 24,
        // color is set dynamically via dynamicStyles.chevron
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
});
