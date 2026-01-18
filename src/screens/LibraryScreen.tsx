/**
 * LibraryScreen - Библиотека упражнений
 * Redesigned with glassmorphism design system
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Input, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { CategoryPill } from '@/components';
import { colors, typography, spacing, radius } from '@/theme';

// Моковые данные упражнений (позже будут из базы)
const EXERCISES = [
    { id: '1', name: 'Bench Press', category: 'Chest', type: 'Barbell', icon: '🏋️' },
    { id: '2', name: 'Incline Dumbbell Press', category: 'Chest', type: 'Dumbbell', icon: '💪' },
    { id: '3', name: 'Pull-ups', category: 'Back', type: 'Bodyweight', icon: '🔝' },
    { id: '4', name: 'Deadlift', category: 'Back', type: 'Barbell', icon: '⬆️' },
    { id: '5', name: 'Squats', category: 'Legs', type: 'Barbell', icon: '🦵' },
    { id: '6', name: 'Leg Press', category: 'Legs', type: 'Machine', icon: '🦿' },
    { id: '7', name: 'Shoulder Press', category: 'Shoulders', type: 'Dumbbell', icon: '🎯' },
    { id: '8', name: 'Lateral Raises', category: 'Shoulders', type: 'Dumbbell', icon: '↔️' },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders'];

export function LibraryScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Фильтрация упражнений
    const filteredExercises = useMemo(() => {
        let result = EXERCISES;

        // Фильтр по категории
        if (selectedCategory !== 'All') {
            result = result.filter(e => e.category === selectedCategory);
        }

        // Фильтр по поиску
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.category.toLowerCase().includes(query)
            );
        }

        return result;
    }, [searchQuery, selectedCategory]);

    // Часто используемые (первые 2)
    const commonlyUsed = filteredExercises.slice(0, 2);

    const renderExerciseCard = (exercise: typeof EXERCISES[0], highlighted = false) => (
        <GlassCard
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => console.log('Selected:', exercise.name)}
        >
            <View style={[styles.exerciseIcon, highlighted && styles.exerciseIconHighlighted]}>
                <Text style={styles.exerciseEmoji}>{exercise.icon}</Text>
            </View>
            <View style={styles.exerciseInfo}>
                <Heading level={3}>{exercise.name}</Heading>
                <UIText variant="body-sm" muted>
                    {exercise.category} • {exercise.type}
                </UIText>
            </View>
            <Text style={styles.chevron}>›</Text>
        </GlassCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
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
                        onPress={() => console.log('Add exercise')}
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
                    contentContainerStyle={styles.categoryPills}
                >
                    {CATEGORIES.map(category => (
                        <CategoryPill
                            key={category}
                            label={category}
                            active={selectedCategory === category}
                            onPress={() => setSelectedCategory(category)}
                            testID={`category-${category.toLowerCase()}`}
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
                    <Label style={styles.sectionLabel}>A-Z</Label>
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
        backgroundColor: colors.background.dark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100, // Space for tab bar
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
    categoryPills: {
        paddingVertical: spacing.sm,
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
        backgroundColor: colors.surface.dark,
        borderWidth: 1,
        borderColor: colors.border.dark,
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
        color: colors.text.muted.dark,
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
