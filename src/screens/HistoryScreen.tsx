/**
 * HistoryScreen - История тренировок и аналитика
 * Connected to real database via useWorkoutHistory and useUserStats hooks
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useWorkoutHistory, useUserStats } from '@/hooks';
import { colors, typography, spacing, radius } from '@/theme';
import type { Workout } from '@/types';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HistoryScreen() {
    const { workouts, loading: historyLoading } = useWorkoutHistory(10);
    const { stats, totalVolume, volumeData, loading: statsLoading } = useUserStats(30);

    const loading = historyLoading || statsLoading;

    // Форматирование даты
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    // Форматирование длительности
    const formatDuration = (seconds: number | null): string => {
        if (!seconds) return '0m';
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m`;
    };

    // Форматирование объёма
    const formatVolume = (volume: number | null): string => {
        if (!volume) return '0kg';
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k kg`;
        }
        return `${Math.round(volume)}kg`;
    };

    // Генерация календаря (текущая неделя)
    const getCalendarDays = (): { day: number; hasWorkout: boolean; isToday: boolean }[] => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const workoutDates = new Set(
            workouts.map(w => w.completed_at?.split('T')[0])
        );

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            return {
                day: date.getDate(),
                hasWorkout: workoutDates.has(dateKey),
                isToday: dateKey === today.toISOString().split('T')[0],
            };
        });
    };

    const calendarDays = getCalendarDays();

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    <UIText variant="body-sm" muted style={styles.loadingText}>
                        Загрузка истории...
                    </UIText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Heading level={1}>History</Heading>
                        <UIText variant="body-sm" accent uppercase style={styles.subtitle}>
                            Analytics Dashboard
                        </UIText>
                    </View>
                    <Button variant="secondary" size="md" testID="calendar-button">
                        <Text style={styles.calendarIcon}>📅</Text>
                    </Button>
                </View>

                {/* Volume Chart Card */}
                <GlassCard glow style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Label>Total Volume (KG)</Label>
                            <View style={styles.volumeRow}>
                                <UIText variant="display" style={styles.volumeValue}>
                                    {formatVolume(totalVolume).replace(' kg', '')}
                                </UIText>
                                {volumeData.length > 1 && (
                                    <View style={styles.percentBadge}>
                                        <Text style={styles.percentText}>Last 30 days</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.periodBadge}>
                            <UIText variant="caption" accent>LAST 30 DAYS</UIText>
                        </View>
                    </View>

                    {/* Simple Chart Visualization */}
                    <View style={styles.chartContainer}>
                        <View style={styles.chartLine}>
                            {volumeData.slice(-7).map((point, index) => {
                                const maxVolume = Math.max(...volumeData.map(p => p.volume), 1);
                                const height = (point.volume / maxVolume) * 100;
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.chartBar,
                                            { height: `${Math.max(5, height)}%` },
                                            index === volumeData.slice(-7).length - 1 && styles.chartBarActive,
                                        ]}
                                    />
                                );
                            })}
                            {volumeData.length === 0 && (
                                <UIText variant="body-sm" muted style={styles.noDataText}>
                                    No workout data yet
                                </UIText>
                            )}
                        </View>
                        <View style={styles.chartGradient} />
                    </View>
                </GlassCard>

                {/* Calendar Card */}
                <GlassCard style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <Heading level={3}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Heading>
                        <View style={styles.calendarNav}>
                            <Text style={styles.navArrow}>‹</Text>
                            <Text style={styles.navArrow}>›</Text>
                        </View>
                    </View>

                    {/* Week Days Header */}
                    <View style={styles.weekDays}>
                        {WEEK_DAYS.map((day, index) => (
                            <Label key={`${day}-${index}`} style={styles.weekDay}>{day}</Label>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {calendarDays.map((dayInfo, index) => (
                            <View key={index} style={styles.calendarDayContainer}>
                                <View style={[
                                    styles.calendarDay,
                                    dayInfo.isToday && styles.calendarDayToday,
                                ]}>
                                    <Text style={[
                                        styles.calendarDayText,
                                        dayInfo.isToday && styles.calendarDayTextToday,
                                    ]}>
                                        {dayInfo.day}
                                    </Text>
                                </View>
                                {dayInfo.hasWorkout && <View style={styles.workoutDot} />}
                            </View>
                        ))}
                    </View>
                </GlassCard>

                {/* Recent Logs */}
                <View style={styles.logsSection}>
                    <Label style={styles.sectionLabel}>Recent Logs ({workouts.length})</Label>
                    {workouts.length === 0 ? (
                        <GlassCard style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <UIText variant="body" muted>No workouts yet</UIText>
                            <UIText variant="body-sm" muted>Complete a workout to see it here</UIText>
                        </GlassCard>
                    ) : (
                        workouts.map((workout: Workout) => (
                            <GlassCard
                                key={workout.id}
                                accent="primary"
                                style={styles.logCard}
                                onPress={() => console.log('View log:', workout.id)}
                            >
                                <View style={styles.logIcon}>
                                    <Text style={styles.logEmoji}>💪</Text>
                                </View>
                                <View style={styles.logInfo}>
                                    <Heading level={3}>{workout.name}</Heading>
                                    <Label style={styles.logMeta}>
                                        {formatDate(workout.completed_at)} • {formatDuration(workout.duration_seconds)} • {formatVolume(workout.total_volume)}
                                    </Label>
                                </View>
                                <Text style={styles.chevron}>›</Text>
                            </GlassCard>
                        ))
                    )}
                </View>
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
        paddingBottom: 100,
        gap: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    subtitle: {
        marginTop: 4,
        letterSpacing: 2,
    },
    calendarIcon: {
        fontSize: 20,
    },

    // Chart Card
    chartCard: {
        padding: spacing.lg,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    volumeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: 4,
    },
    volumeValue: {
        color: colors.text.primary.dark,
    },
    percentBadge: {
        backgroundColor: `${colors.success}1A`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.full,
    },
    percentText: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        color: colors.success,
    },
    periodBadge: {
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: `${colors.primary.DEFAULT}33`,
    },
    chartContainer: {
        height: 128,
        position: 'relative',
        marginTop: spacing.md,
    },
    chartLine: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: '100%',
        paddingHorizontal: spacing.sm,
    },
    chartBar: {
        width: 8,
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: 4,
    },
    chartBarActive: {
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
            },
        }),
    },
    chartGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: `${colors.primary.DEFAULT}0D`,
        borderBottomLeftRadius: radius.md,
        borderBottomRightRadius: radius.md,
    },
    noDataText: {
        flex: 1,
        textAlign: 'center',
    },

    // Calendar Card
    calendarCard: {
        padding: spacing.lg,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    calendarNav: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    navArrow: {
        fontSize: 24,
        color: colors.text.muted.dark,
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    weekDay: {
        width: 32,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    calendarDayContainer: {
        alignItems: 'center',
        width: 32,
    },
    calendarDay: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarDayToday: {
        backgroundColor: `${colors.primary.DEFAULT}33`,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${colors.primary.DEFAULT}66`,
    },
    calendarDayText: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
    },
    calendarDayTextToday: {
        color: colors.primary.DEFAULT,
    },
    workoutDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary.DEFAULT,
        marginTop: 2,
    },

    // Logs Section
    logsSection: {
        gap: spacing.md,
    },
    sectionLabel: {
        marginLeft: spacing.xs,
    },
    emptyCard: {
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.sm,
    },
    emptyIcon: {
        fontSize: 48,
    },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    logIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        backgroundColor: `${colors.primary.DEFAULT}1A`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logEmoji: {
        fontSize: 24,
    },
    logInfo: {
        flex: 1,
    },
    logMeta: {
        marginTop: 4,
    },
    chevron: {
        fontSize: 24,
        color: colors.text.muted.dark,
    },
});
