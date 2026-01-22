/**
 * HomeScreen - Main home screen with Start Workout functionality
 * Displays current date and provides access to start new workouts
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard, Button, Heading } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useThemeColors, useUserStats } from '@/hooks';
import { colors, typography, spacing, radius } from '@/theme';
import { StartWorkoutModal } from '@/components';
import { triggerSelection } from '@/utils/haptics';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { SelectedExercise } from '@/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

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
            await refetch?.();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

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

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
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
                    <Heading level={1} accent>{todayDate}</Heading>
                </View>

                {/* Main Content - Start Workout Section */}
                <View style={styles.mainContent}>
                    <GlassCard style={styles.welcomeCard} glow>
                        <Text style={styles.welcomeEmoji}>🏋️</Text>
                        <Heading level={2} style={styles.welcomeTitle}>Ready to Train?</Heading>
                        <UIText variant="body" muted style={styles.welcomeText}>Start a new workout session and track your progress</UIText>
                    </GlassCard>

                    {/* Start Workout Button */}
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

                {/* Quick Stats Preview */}
                <View style={styles.statsSection}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statEmoji}>📊</Text>
                        <View style={styles.statInfo}>
                            <UIText variant="caption" muted>This Week</UIText>
                            <Heading level={3}>{stats?.totalWorkouts || 0} Workouts</Heading>
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statEmoji}>🔥</Text>
                        <View style={styles.statInfo}>
                            <UIText variant="caption" muted>Streak</UIText>
                            <Heading level={3}>{stats?.weekStreak || 0} Weeks</Heading>
                        </View>
                    </GlassCard>
                </View>
            </ScrollView>

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
        paddingBottom: 120,
    },

    // Header
    header: {
        marginBottom: spacing.xl,
    },

    // Main Content
    mainContent: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    welcomeCard: {
        width: '100%',
        alignItems: 'center',
        padding: spacing.xl,
        marginBottom: spacing.lg,
    },
    welcomeEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    welcomeTitle: {
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    welcomeText: {
        textAlign: 'center',
    },
    startButton: {
        width: '100%',
        height: 64,
    },

    // Stats Section
    statsSection: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    statEmoji: {
        fontSize: 32,
    },
    statInfo: {
        flex: 1,
    },
});
