/**
 * HomeScreen - Main home screen with Start Workout functionality
 * Displays current date and provides access to start new workouts
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useThemeColors, useUserStats, useWorkoutTemplates } from '@/hooks';
import { colors, typography, spacing } from '@/theme';
import { StartWorkoutModal } from '@/components';
import { triggerSelection } from '@/utils/haptics';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { SelectedExercise } from '@/types';
import type { TabParamList } from '@/navigation/TabNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
    MaterialTopTabNavigationProp<TabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList, 'Main'>
>;

// TODO(ai): Replace placeholders with AI-provided recommendations.
const AI_RECOMMENDATIONS = [
    { id: 'ai-1', title: 'Workout A', focus: 'develop your strength' },
    { id: 'ai-2', title: 'Workout B', focus: 'help you with this' },
    { id: 'ai-3', title: 'Workout C', focus: 'help you with that' },
];

/**
 * Format date as "dd MMM, dddd" (e.g., "19 Jan, Sunday")
 */
function formatDateHeader(date: Date): string {
    const day = date.getDate().toString();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    return `${day} ${month}, ${dayName}`;
}

export function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const themeColors = useThemeColors();
    const { stats, refetch } = useUserStats();
    const { templates, refetch: refetchTemplates } = useWorkoutTemplates(20);
    const insets = useSafeAreaInsets();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
    }), [themeColors]);

    const todayDate = formatDateHeader(new Date());

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        triggerSelection();
        try {
            await Promise.all([
                refetch?.(),
                refetchTemplates(),
            ]);
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, refetchTemplates]);

    const handleStartWorkout = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    // Handle navigation to ActiveWorkoutScreen
    const handleStartWorkoutNavigation = useCallback((params: {
        templateId?: string;
        workoutId?: string;
        exercises?: SelectedExercise[];
    }) => {
        console.log('Navigating to ActiveWorkout...');
        console.log('[HomeScreen] Params:', { ...params, exercises: params.exercises?.length });

        try {
            navigation.navigate('ActiveWorkout', {
                templateId: params.templateId,
                workoutId: params.workoutId,
                exercises: params.exercises,
            });
        } catch (error) {
            console.error('[HomeScreen] Navigation failed:', error);
        }
    }, [navigation]);

    const getTemplateEmoji = (icon: string): string => {
        const iconMap: Record<string, string> = {
            fitness_center: '📋',
        };
        return iconMap[icon] || '📋';
    };

    const publicTemplates = useMemo(() => templates.filter(template => template.is_system), [templates]);
    // TODO(ai): Swap this selection with AI-curated recommendations once available.
    const myTemplates = useMemo(() => templates.filter(template => !template.is_system), [templates]);
    const recommendations = useMemo(() => publicTemplates.slice(0, 3), [publicTemplates]);

    const startButtonOffset = insets.bottom + spacing.xs;

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: startButtonOffset + 64 + spacing.md },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.DEFAULT}
                        colors={[colors.primary.DEFAULT]}
                    />
                }
            >
                {/* Header with Date */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Heading level={1} accent>{todayDate}</Heading>
                        <UIText variant="body-sm" muted style={styles.workoutCount}>
                            {stats?.totalWorkouts ?? 0} workouts
                        </UIText>
                    </View>
                    <GlassCard
                        style={styles.streakCard}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View style={styles.streakText}>
                            <UIText variant="caption" style={styles.streakValue}>
                                {stats?.weekStreak ?? 0} weeks
                            </UIText>
                            <UIText variant="caption" muted>in a row</UIText>
                        </View>
                    </GlassCard>
                </View>

                {/* AI Summary Card */}
                <GlassCard style={styles.aiSummaryCard} glow>
                    <View style={styles.aiSummaryHeader}>
                        <Text style={styles.aiSummaryEmoji}>🧠</Text>
                        <Heading level={3}>AI Summary</Heading>
                    </View>
                    {/* TODO(ai): Replace static summary text with AI-generated summary. */}
                    <UIText variant="body-sm" style={styles.aiSummaryText}>
                        This week you focused on this and that. Today I recommend you to complete some of that workouts because they are ideal fit for your goal.
                    </UIText>
                    <View style={styles.sectionHeader}>
                        <Label style={styles.sectionLabel}>Recommended Workouts</Label>
                    </View>
                    <View style={styles.recommendationsList}>
                        {recommendations.length > 0 ? (
                            recommendations.map(template => (
                                <Pressable
                                    key={template.id}
                                    onPress={() => {
                                        triggerSelection();
                                        navigation.navigate('ActiveWorkout', { templateId: template.id });
                                    }}
                                    style={styles.recommendationLink}
                                >
                                    <UIText variant="body-sm" style={styles.recommendationLinkText}>
                                        {template.name} →
                                    </UIText>
                                </Pressable>
                            ))
                        ) : (
                            AI_RECOMMENDATIONS.map(item => (
                                <Pressable key={item.id} style={styles.recommendationLink}>
                                    <UIText variant="body-sm" style={styles.recommendationLinkText}>
                                        {item.title}: {item.focus} →
                                    </UIText>
                                </Pressable>
                            ))
                        )}
                    </View>
                </GlassCard>

                {/* My Templates */}
                {myTemplates.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Label style={styles.sectionLabel}>My Templates</Label>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.templatesList}
                        >
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

            </ScrollView>

            <View style={[styles.startButtonContainer, { bottom: startButtonOffset }]}>
                <Button
                    variant="primary"
                    size="lg"
                    glow
                    onPress={handleStartWorkout}
                    style={styles.startButton}
                    testID="start-workout-button"
                >
                    START WORKOUT
                </Button>
            </View>

            {/* Start Workout Modal */}
            <StartWorkoutModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onStartWorkout={handleStartWorkoutNavigation}
            />
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
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    headerText: {
        flex: 1,
    },
    workoutCount: {
        marginTop: spacing.xs,
    },
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        height: 40,
        gap: spacing.xs,
        minWidth: 130,
        marginLeft: spacing.md,
    },
    streakEmoji: {
        fontSize: 18,
    },
    streakText: {
        alignItems: 'flex-start',
    },
    streakValue: {
        fontWeight: typography.fontWeight.bold,
    },

    // AI Summary
    aiSummaryCard: {
        width: '100%',
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    aiSummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    aiSummaryEmoji: {
        fontSize: 20,
    },
    aiSummaryText: {
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    recommendationsList: {
        gap: spacing.xs,
    },
    recommendationLink: {
        paddingVertical: 2,
    },
    recommendationLinkText: {
        color: colors.primary.DEFAULT,
        textDecorationLine: 'underline',
    },

    // Sections
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        marginBottom: spacing.sm,
    },
    sectionLabel: {
        letterSpacing: 0.5,
    },
    templatesList: {
        gap: spacing.sm,
        paddingRight: spacing.sm,
    },
    templateCard: {
        width: 120,
        padding: spacing.md,
        alignItems: 'center',
        gap: spacing.xs,
    },
    templateEmoji: {
        fontSize: 20,
    },
    templateName: {
        textAlign: 'center',
    },

    startButton: {
        width: '100%',
        height: 64,
    },
    startButtonContainer: {
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
    },
});
