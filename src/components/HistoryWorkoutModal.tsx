import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Modal, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { Text } from 'react-native';
import { useThemeColors } from '@/hooks';
import { useSettings } from '@/context/SettingsContext';
import { getWorkoutDetails } from '@/services/workoutService';
import { triggerSelection } from '@/utils/haptics';
import { colors, spacing } from '@/theme';
import { type Workout, type Set, convertWeight, type UnitPreference } from '@/types';

interface HistoryWorkoutModalProps {
    visible: boolean;
    workoutId: string | null;
    onClose: () => void;
}

export function HistoryWorkoutModal({ visible, workoutId, onClose }: HistoryWorkoutModalProps) {
    const themeColors = useThemeColors();
    const { units } = useSettings();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [loading, setLoading] = useState(true);

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        handleBar: { backgroundColor: themeColors.textMuted },
        header: { borderBottomColor: themeColors.border },
        closeButton: { backgroundColor: themeColors.surface },
        closeIcon: { color: themeColors.textSecondary },
        sectionLabel: { color: themeColors.textSecondary },
        tableHeader: { borderBottomColor: themeColors.border },
        tableRow: { borderBottomColor: themeColors.border },
        summaryValue: { color: themeColors.textPrimary },
    }), [themeColors]);

    // Derived unit preferences
    const unitPref: UnitPreference = units === 'imperial' ? 'lbs' : 'kg';
    const weightUnitLabel = units === 'imperial' ? 'LBS' : 'KG';
    const distanceUnitLabel = units === 'imperial' ? 'MI' : 'KM';

    // Helpers
    const displayWeight = (kg: number) => Math.round(convertWeight(kg, unitPref));
    const displayDistance = (km: number) => {
        if (!km) return 0;
        return units === 'imperial'
            ? Number((km * 0.621371).toFixed(2))
            : km;
    };

    useEffect(() => {
        if (visible && workoutId) {
            loadWorkoutDetails();
        } else {
            setWorkout(null);
            setLoading(true);
        }
    }, [visible, workoutId]);

    const loadWorkoutDetails = async () => {
        if (!workoutId) return;
        setLoading(true);
        try {
            const data = await getWorkoutDetails(workoutId);
            setWorkout(data);
        } catch (error) {
            console.error('Failed to load workout details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Approximate calories (very rough estimate: 0.05 kcal/kg/min * 70kg user ~ 3.5 kcal/min for creating lifting)
    // Or just 5 kcal/min for active lifting
    const calculateCalories = (seconds: number | null) => {
        if (!seconds) return 0;
        const minutes = seconds / 60;
        return Math.round(minutes * 5);
    };

    if (!visible) return null;

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
                        <View>
                            <Heading level={2}>Workout Log</Heading>
                            {workout && (
                                <UIText variant="caption" muted>
                                    {formatDate(workout.completed_at)}
                                </UIText>
                            )}
                        </View>
                        <Pressable
                            onPress={() => { triggerSelection(); onClose(); }}
                            style={[styles.closeButton, dynamicStyles.closeButton]}
                        >
                            <Text style={[styles.closeIcon, dynamicStyles.closeIcon]}>✕</Text>
                        </Pressable>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                    </View>
                ) : workout ? (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Summary Card */}
                        <GlassCard style={styles.summaryCard}>
                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Label style={styles.summaryLabel}>Volume</Label>
                                    <UIText variant="display" style={[dynamicStyles.summaryValue, { fontSize: 24 }]}>
                                        {displayWeight(workout.total_volume || 0)} {weightUnitLabel.toLowerCase()}
                                    </UIText>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Label style={styles.summaryLabel}>Duration</Label>
                                    <UIText variant="display" style={[dynamicStyles.summaryValue, { fontSize: 24 }]}>
                                        {formatDuration(workout.duration_seconds)}
                                    </UIText>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Label style={styles.summaryLabel}>Calories</Label>
                                    <UIText variant="display" style={[dynamicStyles.summaryValue, { fontSize: 24 }]}>
                                        ~{calculateCalories(workout.duration_seconds)}
                                    </UIText>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Label style={styles.summaryLabel}>Exercises</Label>
                                    <UIText variant="display" style={[dynamicStyles.summaryValue, { fontSize: 24 }]}>
                                        {workout.exercises?.length || 0}
                                    </UIText>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Exercises List */}
                        <View style={styles.exercisesList}>
                            {workout.exercises?.map((exercise) => {
                                const trackingType = exercise.exercise?.tracking_type || 'weight_reps';
                                const weightLabel = trackingType === 'weighted_bodyweight' ? `+${weightUnitLabel}` : weightUnitLabel;

                                return (
                                    <GlassCard key={exercise.id} style={styles.exerciseCard}>
                                        <View style={styles.exerciseHeader}>
                                            <Text style={styles.exerciseEmoji}>
                                                {exercise.exercise?.icon === 'fitness_center' ? '🏋️' : '💪'}
                                            </Text>
                                            <View>
                                                <Heading level={3}>{exercise.exercise?.name || 'Unknown Exercise'}</Heading>
                                                <UIText variant="body-sm" muted>
                                                    {exercise.exercise?.muscle_group?.name || 'Unknown Group'}
                                                </UIText>
                                            </View>
                                        </View>

                                        {/* Sets Table */}
                                        <View style={styles.setsTable}>
                                            <View style={[styles.tableHeader, dynamicStyles.tableHeader]}>
                                                <Label style={[styles.colSet, { textAlign: 'center' }]}>SET</Label>

                                                {/* Dynamic Headers */}
                                                {(trackingType === 'weight_reps' || trackingType === 'weighted_bodyweight') && (
                                                    <>
                                                        <Label style={[styles.colWeight, { textAlign: 'center' }]}>{weightLabel}</Label>
                                                        <Label style={[styles.colReps, { textAlign: 'center' }]}>REPS</Label>
                                                    </>
                                                )}
                                                {trackingType === 'duration' && (
                                                    <Label style={[styles.colWeight, { textAlign: 'center', flex: 2 }]}>TIME</Label>
                                                )}
                                                {trackingType === 'distance_duration' && (
                                                    <>
                                                        <Label style={[styles.colWeight, { textAlign: 'center' }]}>{distanceUnitLabel}</Label>
                                                        <Label style={[styles.colReps, { textAlign: 'center' }]}>TIME</Label>
                                                    </>
                                                )}
                                            </View>

                                            {exercise.sets?.map((set) => (
                                                <View key={set.id} style={[styles.tableRow, dynamicStyles.tableRow]}>
                                                    <View style={styles.colSet}>
                                                        <View style={[
                                                            styles.setBadge,
                                                            set.is_warmup && styles.setBadgeWarmup,
                                                            set.is_dropset && styles.setBadgeDrop
                                                        ]}>
                                                            <UIText variant="caption" style={styles.setText}>
                                                                {set.set_number}
                                                            </UIText>
                                                        </View>
                                                    </View>

                                                    {/* Dynamic Values */}
                                                    {(trackingType === 'weight_reps' || trackingType === 'weighted_bodyweight') && (
                                                        <>
                                                            <UIText variant="body" style={[styles.colWeight, { textAlign: 'center' }]}>
                                                                {displayWeight(set.weight)}
                                                            </UIText>
                                                            <UIText variant="body" style={[styles.colReps, { textAlign: 'center' }]}>
                                                                {set.reps}
                                                            </UIText>
                                                        </>
                                                    )}
                                                    {trackingType === 'duration' && (
                                                        <UIText variant="body" style={[styles.colWeight, { textAlign: 'center', flex: 2 }]}>
                                                            {formatDuration(set.duration_seconds || 0)}
                                                        </UIText>
                                                    )}
                                                    {trackingType === 'distance_duration' && (
                                                        <>
                                                            <UIText variant="body" style={[styles.colWeight, { textAlign: 'center' }]}>
                                                                {displayDistance(set.distance || 0)}
                                                            </UIText>
                                                            <UIText variant="body" style={[styles.colReps, { textAlign: 'center' }]}>
                                                                {formatDuration(set.duration_seconds || 0)}
                                                            </UIText>
                                                        </>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    </GlassCard>
                                );
                            })}
                        </View>

                        {/* Bottom Padding */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                ) : (
                    <View style={styles.errorContainer}>
                        <UIText variant="body" muted>Workout not found</UIText>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        gap: spacing.lg,
    },
    summaryCard: {
        padding: spacing.md,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: spacing.md,
    },
    summaryItem: {
        width: '50%',
        paddingHorizontal: spacing.sm,
    },
    summaryLabel: {
        marginBottom: 4,
        fontSize: 12,
    },
    exercisesList: {
        gap: spacing.md,
    },
    exerciseCard: {
        padding: spacing.md,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    exerciseEmoji: {
        fontSize: 24,
    },
    setsTable: {
        marginTop: spacing.xs,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: spacing.sm,
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
        opacity: 0.7,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    colSet: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colWeight: {
        flex: 1,
    },
    colReps: {
        flex: 1,
    },
    setBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    setBadgeWarmup: {
        backgroundColor: '#FFB02E33', // Static yellow with opacity
        borderWidth: 1,
        borderColor: '#FFB02E', // Static yellow
    },
    setBadgeDrop: {
        backgroundColor: colors.error + '33',
        borderWidth: 1,
        borderColor: colors.error,
    },
    setText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
});
