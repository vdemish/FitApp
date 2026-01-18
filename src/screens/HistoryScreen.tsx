/**
 * HistoryScreen - История тренировок и аналитика
 * Redesigned with glassmorphism design system
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { colors, typography, spacing, radius } from '@/theme';

// Моковые данные логов (позже будут из базы)
const RECENT_LOGS = [
    { id: '1', name: 'Push Day A', date: 'Oct 03', duration: '58m', volume: '4,200kg', icon: '💪' },
    { id: '2', name: 'Pull Day B', date: 'Oct 01', duration: '52m', volume: '3,800kg', icon: '🔙' },
    { id: '3', name: 'Leg Day', date: 'Sep 29', duration: '65m', volume: '5,100kg', icon: '🦵' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CALENDAR_DAYS = [28, 29, 30, 1, 2, 3, 4];
const WORKOUT_DAYS = [1, 3]; // дни с тренировками

const { width: screenWidth } = Dimensions.get('window');

export function HistoryScreen() {
    const [currentMonth] = useState('October 2023');

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
                                <UIText variant="display" style={styles.volumeValue}>142,500</UIText>
                                <View style={styles.percentBadge}>
                                    <Text style={styles.percentText}>+12%</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.periodBadge}>
                            <UIText variant="caption" accent>LAST 30 DAYS</UIText>
                        </View>
                    </View>

                    {/* Simple Chart Visualization */}
                    <View style={styles.chartContainer}>
                        <View style={styles.chartLine}>
                            {[35, 32, 25, 28, 15, 10, 5].map((height, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.chartBar,
                                        { height: `${100 - height}%` },
                                        index === 6 && styles.chartBarActive,
                                    ]}
                                />
                            ))}
                        </View>
                        <View style={styles.chartGradient} />
                    </View>

                    <View style={styles.chartLabels}>
                        <Label>Oct 01</Label>
                        <Label>Oct 15</Label>
                        <Label>Oct 31</Label>
                    </View>
                </GlassCard>

                {/* Calendar Card */}
                <GlassCard style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <Heading level={3}>{currentMonth}</Heading>
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
                        {CALENDAR_DAYS.map((day, index) => {
                            const isPast = day > 20; // дни прошлого месяца
                            const hasWorkout = WORKOUT_DAYS.includes(day);
                            const isToday = day === 3;

                            return (
                                <View key={index} style={styles.calendarDayContainer}>
                                    <View style={[
                                        styles.calendarDay,
                                        isToday && styles.calendarDayToday,
                                    ]}>
                                        <Text style={[
                                            styles.calendarDayText,
                                            isPast && styles.calendarDayPast,
                                            isToday && styles.calendarDayTextToday,
                                        ]}>
                                            {day}
                                        </Text>
                                    </View>
                                    {hasWorkout && <View style={styles.workoutDot} />}
                                </View>
                            );
                        })}
                    </View>
                </GlassCard>

                {/* Recent Logs */}
                <View style={styles.logsSection}>
                    <Label style={styles.sectionLabel}>Recent Logs</Label>
                    {RECENT_LOGS.map(log => (
                        <GlassCard
                            key={log.id}
                            accent="primary"
                            style={styles.logCard}
                            onPress={() => console.log('View log:', log.id)}
                        >
                            <View style={styles.logIcon}>
                                <Text style={styles.logEmoji}>{log.icon}</Text>
                            </View>
                            <View style={styles.logInfo}>
                                <Heading level={3}>{log.name}</Heading>
                                <Label style={styles.logMeta}>
                                    {log.date} • {log.duration} • {log.volume}
                                </Label>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </GlassCard>
                    ))}
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
        justifyContent: 'space-between',
        height: '100%',
        paddingHorizontal: spacing.sm,
    },
    chartBar: {
        width: 4,
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: 2,
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
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
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
    calendarDayPast: {
        color: colors.text.muted.dark,
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
