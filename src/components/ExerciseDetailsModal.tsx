import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
    Pressable,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseDetailsCard } from '@/components/ExerciseDetailsCard';
import { Heading } from '@/components/ui';
import { useThemeColors } from '@/hooks';
import { useSettings } from '@/context/SettingsContext';
import { triggerSelection } from '@/utils/haptics';
import { colors, spacing, radius } from '@/theme';
import type { Exercise, ExerciseHistory, UnitPreference, WorkoutTemplate } from '@/types';

interface ExerciseDetailsModalProps {
    visible: boolean;
    exercise: Exercise | null;
    history?: ExerciseHistory | null;
    publicTemplates?: WorkoutTemplate[];
    privateTemplates?: WorkoutTemplate[];
    shareUri?: string | null;
    loading?: boolean;
    onClose: () => void;
}

export function ExerciseDetailsModal({
    visible,
    exercise,
    history,
    publicTemplates = [],
    privateTemplates = [],
    shareUri,
    loading = false,
    onClose,
}: ExerciseDetailsModalProps) {
    const themeColors = useThemeColors();
    const { units } = useSettings();
    const unitPref: UnitPreference = units === 'imperial' ? 'lbs' : 'kg';

    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        handleBar: { backgroundColor: themeColors.textMuted },
        header: { borderBottomColor: themeColors.border },
        closeButton: { backgroundColor: themeColors.surface },
        closeIcon: { color: themeColors.textSecondary },
    }), [themeColors]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
                <View style={[styles.header, dynamicStyles.header]}>
                    <View style={[styles.handleBar, dynamicStyles.handleBar]} />
                    <View style={styles.headerContent}>
                        <Heading level={2}>{exercise?.name ?? 'Exercise'}</Heading>
                        <Pressable
                            onPress={() => {
                                triggerSelection();
                                onClose();
                            }}
                            style={[styles.closeButton, dynamicStyles.closeButton]}
                        >
                            <Text style={[styles.closeIcon, dynamicStyles.closeIcon]}>✕</Text>
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {exercise && (
                        <ExerciseDetailsCard
                            exercise={exercise}
                            personalRecords={{
                                maxWeightKg: history?.max_weight ?? null,
                                maxReps: history?.last_reps ?? null,
                                unit: unitPref,
                            }}
                            publicTemplates={publicTemplates}
                            privateTemplates={privateTemplates}
                            shareUri={shareUri}
                        />
                    )}

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 999,
        alignSelf: 'center',
        marginTop: spacing.sm,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    closeButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
    },
    closeIcon: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    loadingContainer: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
});
