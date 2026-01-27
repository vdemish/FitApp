import React, { useMemo } from 'react';
import {
    View,
    Image,
    ScrollView,
    Alert,
    StyleSheet,
    type ImageSourcePropType,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useThemeColors } from '@/hooks';
import type { Exercise, WorkoutTemplate, UnitPreference } from '@/types';
import { formatWeight } from '@/types';
import { spacing, radius } from '@/theme';

interface PersonalRecordStats {
    maxWeightKg?: number | null;
    maxReps?: number | null;
    unit?: UnitPreference;
}

interface ExerciseDetailsCardProps {
    exercise: Exercise;
    imageSource?: ImageSourcePropType;
    shareUri?: string | null;
    personalRecords?: PersonalRecordStats;
    publicTemplates?: WorkoutTemplate[];
    privateTemplates?: WorkoutTemplate[];
}

export function ExerciseDetailsCard({
    exercise,
    imageSource,
    shareUri,
    personalRecords,
    publicTemplates = [],
    privateTemplates = [],
}: ExerciseDetailsCardProps) {
    const themeColors = useThemeColors();
    const instructions = exercise.instructions?.trim() || 'No instructions added yet.';
    const shareLabel = `Share ${exercise.name}`;

    const maxWeightLabel = useMemo(() => {
        if (!personalRecords?.maxWeightKg) return '—';
        return formatWeight(personalRecords.maxWeightKg, personalRecords.unit ?? 'kg');
    }, [personalRecords?.maxWeightKg, personalRecords?.unit]);

    const maxRepsLabel = useMemo(() => {
        if (!personalRecords?.maxReps) return '—';
        return `${personalRecords.maxReps} reps`;
    }, [personalRecords?.maxReps]);

    const handleShare = async () => {
        if (!shareUri) {
            Alert.alert('Share unavailable', 'Add a shareable image or GIF to enable sharing.');
            return;
        }

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('Share unavailable', 'Sharing is not available on this device.');
            return;
        }

        await Sharing.shareAsync(shareUri, { dialogTitle: shareLabel });
    };

    const dynamicStyles = useMemo(() => ({
        imagePlaceholder: {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
        },
        statCard: {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
        },
        templatePill: {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
        },
    }), [themeColors]);

    return (
        <View style={styles.container}>
            <GlassCard style={styles.imageCard}>
                {imageSource ? (
                    <Image source={imageSource} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.imagePlaceholder, dynamicStyles.imagePlaceholder]}>
                        <Label>IMAGE PLACEHOLDER</Label>
                        <UIText variant="caption" muted style={styles.imagePlaceholderText}>
                            Add illustration or GIF
                        </UIText>
                    </View>
                )}
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
                <Heading level={3}>Instructions</Heading>
                <UIText variant="body-sm" muted style={styles.sectionBody}>
                    {instructions}
                </UIText>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
                <Heading level={3}>Personal Records</Heading>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, dynamicStyles.statCard]}>
                        <UIText variant="caption" uppercase muted>
                            Max Weight
                        </UIText>
                        <UIText variant="display" style={styles.statValue}>
                            {maxWeightLabel}
                        </UIText>
                    </View>
                    <View style={[styles.statCard, dynamicStyles.statCard]}>
                        <UIText variant="caption" uppercase muted>
                            Max Reps
                        </UIText>
                        <UIText variant="display" style={styles.statValue}>
                            {maxRepsLabel}
                        </UIText>
                    </View>
                </View>
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
                <Heading level={3}>Templates</Heading>
                <View style={styles.templateSection}>
                    <View style={styles.templateHeader}>
                        <UIText variant="body-sm" muted>Public</UIText>
                        <UIText variant="caption" muted>{publicTemplates.length}</UIText>
                    </View>
                    {publicTemplates.length === 0 ? (
                        <UIText variant="body-sm" muted style={styles.templateEmpty}>
                            Not used in any public templates yet.
                        </UIText>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {publicTemplates.map(template => (
                                <View
                                    key={`public-${template.id}`}
                                    style={[styles.templatePill, dynamicStyles.templatePill]}
                                >
                                    <UIText variant="caption" muted>{template.name}</UIText>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.templateSection}>
                    <View style={styles.templateHeader}>
                        <UIText variant="body-sm" muted>Private</UIText>
                        <UIText variant="caption" muted>{privateTemplates.length}</UIText>
                    </View>
                    {privateTemplates.length === 0 ? (
                        <UIText variant="body-sm" muted style={styles.templateEmpty}>
                            Not used in your personal templates yet.
                        </UIText>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {privateTemplates.map(template => (
                                <View
                                    key={`private-${template.id}`}
                                    style={[styles.templatePill, dynamicStyles.templatePill]}
                                >
                                    <UIText variant="caption" muted>{template.name}</UIText>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </GlassCard>

            <Button variant="primary" size="md" fullWidth onPress={handleShare}>
                {shareLabel}
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    imageCard: {
        padding: 0,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
    },
    imagePlaceholder: {
        height: 200,
        borderRadius: radius.card,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    imagePlaceholderText: {
        textAlign: 'center',
    },
    sectionCard: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    sectionBody: {
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xs,
    },
    statValue: {
        fontSize: 20,
    },
    templateSection: {
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    templateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    templatePill: {
        paddingVertical: 6,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.full,
        borderWidth: 1,
        marginRight: spacing.sm,
    },
    templateEmpty: {
        marginTop: spacing.xs,
    },
});
