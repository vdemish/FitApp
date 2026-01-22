/**
 * ProfileScreen - Профиль пользователя и настройки
 * Connected to real database via useUserStats and AuthContext
 */

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useUserStats, useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';
import { GlassCard, Button, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { colors, typography, spacing, radius } from '@/theme';

export function ProfileScreen() {
    const { user, profile, signOut } = useAuth();
    const { stats, loading, refetch } = useUserStats();
    const { activeTheme, setTheme, restTimerSounds, toggleRestTimerSounds } = useSettings();
    const themeColors = useThemeColors();
    const [refreshing, setRefreshing] = useState(false);

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

    // Toggle between dark and light themes
    const handleThemeToggle = async (isDark: boolean) => {
        await setTheme(isDark ? 'dark' : 'light');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    };

    // Получаем инициалы для аватара
    const getInitials = () => {
        if (profile?.full_name) {
            return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || '?';
    };

    // Форматирование веса
    const formatWeight = (weight: number | null | undefined): string => {
        if (!weight) return '--';
        return Number(weight.toFixed(2)).toString();
    };

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: {
            backgroundColor: themeColors.background,
        },
        statsRowBorder: {
            borderTopColor: themeColors.border,
        },
        statValue: {
            color: themeColors.textPrimary,
        },
        statDivider: {
            backgroundColor: themeColors.border,
        },
        settingsLabel: {
            color: themeColors.textPrimary,
        },
        settingsDivider: {
            backgroundColor: themeColors.border,
        },
        chevron: {
            color: themeColors.textMuted,
        },
        settingsRowPressed: {
            backgroundColor: themeColors.surface,
        },
    }), [themeColors]);

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
                {/* Profile Header Card */}
                <GlassCard glow style={styles.profileCard}>
                    {/* Декоративный блюр */}
                    <View style={styles.decorativeBlob} />

                    <View style={styles.profileHeader}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials()}</Text>
                            </View>
                            <View style={styles.editBadge}>
                                <Text style={styles.editIcon}>✏️</Text>
                            </View>
                        </View>

                        {/* Name & Status */}
                        <View style={styles.profileInfo}>
                            <Heading level={2}>{profile?.full_name || 'Пользователь'}</Heading>
                            <UIText variant="body-sm" accent uppercase style={styles.memberStatus}>
                                Premium Member
                            </UIText>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={[styles.statsRow, dynamicStyles.statsRowBorder]}>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                        ) : (
                            <>
                                <View style={styles.statItem}>
                                    <UIText variant="display" style={styles.statValue}>
                                        {stats?.totalWorkouts || 0}
                                    </UIText>
                                    <Label>Workouts</Label>
                                </View>
                                <View style={[styles.statDivider, dynamicStyles.statDivider]} />
                                <View style={styles.statItem}>
                                    <UIText variant="display" accent style={styles.statValue}>
                                        {formatWeight(stats?.currentWeight)}
                                    </UIText>
                                    <Label>Weight (kg)</Label>
                                </View>
                                <View style={[styles.statDivider, dynamicStyles.statDivider]} />
                                <View style={styles.statItem}>
                                    <UIText variant="display" style={styles.statValue}>
                                        {stats?.weekStreak || 0}
                                    </UIText>
                                    <Label>Week Streak</Label>
                                </View>
                            </>
                        )}
                    </View>
                </GlassCard>

                {/* Account Settings Section */}
                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>Account Settings</Label>
                    <GlassCard style={styles.settingsCard}>
                        <SettingsRow
                            icon="👤"
                            label="Personal Information"
                            onPress={() => console.log('Personal Info')}
                        />
                        <View style={[styles.settingsDivider, dynamicStyles.settingsDivider]} />
                        <SettingsRow
                            icon="📊"
                            label="Training Metrics"
                            onPress={() => console.log('Training Metrics')}
                        />
                        <View style={[styles.settingsDivider, dynamicStyles.settingsDivider]} />
                        <SettingsRow
                            icon="🔔"
                            label="Reminders & Notifications"
                            onPress={() => console.log('Notifications')}
                        />
                    </GlassCard>
                </View>

                {/* App Preferences Section */}
                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>App Preferences</Label>
                    <GlassCard style={styles.settingsCard}>
                        {/* Dark Mode Toggle */}
                        <View style={styles.settingsRow}>
                            <View style={styles.settingsRowLeft}>
                                <Text style={styles.settingsIcon}>🌙</Text>
                                <UIText style={styles.settingsLabel}>Dark Mode</UIText>
                            </View>
                            <Switch
                                value={activeTheme === 'dark'}
                                onValueChange={handleThemeToggle}
                                trackColor={{
                                    false: themeColors.border,
                                    true: themeColors.primary,
                                }}
                                thumbColor={themeColors.surface}
                                testID="dark-mode-switch"
                            />
                        </View>
                        <View style={[styles.settingsDivider, dynamicStyles.settingsDivider]} />
                        {/* Rest Timer Sounds */}
                        <View style={styles.settingsRow}>
                            <View style={styles.settingsRowLeft}>
                                <Text style={styles.settingsIcon}>⏱</Text>
                                <UIText style={styles.settingsLabel}>Rest Timer Sounds</UIText>
                            </View>
                            <Switch
                                value={restTimerSounds}
                                onValueChange={toggleRestTimerSounds}
                                trackColor={{
                                    false: themeColors.border,
                                    true: themeColors.primary,
                                }}
                                thumbColor={themeColors.surface}
                            />
                        </View>
                        <View style={[styles.settingsDivider, dynamicStyles.settingsDivider]} />
                        <SettingsRow
                            icon="⚖️"
                            label="Units (kg, cm)"
                            value="Metric"
                            onPress={() => console.log('Units')}
                        />
                    </GlassCard>
                </View>

                {/* Sign Out Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.signOutButton,
                        pressed && styles.signOutButtonPressed,
                    ]}
                    onPress={() => {
                        triggerSelection();
                        handleSignOut();
                    }}
                    testID="sign-out-button"
                >
                    <Text style={styles.signOutText}>Выйти из аккаунта</Text>
                </Pressable>

                {/* Version Info */}
                <Label style={styles.versionInfo}>Version 2.4.0 (Build 982)</Label>
            </ScrollView>
        </SafeAreaView>
    );
}

// ==========================================
// SettingsRow Component
// ==========================================

interface SettingsRowProps {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
}

function SettingsRow({ icon, label, value, onPress }: SettingsRowProps) {
    const themeColors = useThemeColors();

    const dynamicStyles = useMemo(() => ({
        settingsLabel: { color: themeColors.textPrimary },
        chevron: { color: themeColors.textMuted },
        pressed: { backgroundColor: themeColors.surface },
    }), [themeColors]);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.settingsRow,
                pressed && dynamicStyles.pressed,
            ]}
            onPress={() => {
                triggerSelection();
                onPress?.();
            }}
        >
            <View style={styles.settingsRowLeft}>
                <Text style={styles.settingsIcon}>{icon}</Text>
                <UIText style={[styles.settingsLabel, dynamicStyles.settingsLabel]}>{label}</UIText>
            </View>
            <View style={styles.settingsRowRight}>
                {value && (
                    <UIText variant="body-sm" accent style={styles.settingsValue}>
                        {value}
                    </UIText>
                )}
                <Text style={[styles.chevron, dynamicStyles.chevron]}>›</Text>
            </View>
        </Pressable>
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
        gap: spacing.lg,
    },

    // Profile Card
    profileCard: {
        padding: spacing.lg,
        overflow: 'hidden',
    },
    decorativeBlob: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${colors.primary.DEFAULT}1A`,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: radius.xl,
        backgroundColor: colors.primary.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: `${colors.primary.DEFAULT}80`,
    },
    avatarText: {
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: colors.background.dark,
    },
    editBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background.dark,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    editIcon: {
        fontSize: 12,
    },
    profileInfo: {
        flex: 1,
    },
    memberStatus: {
        marginTop: 4,
        letterSpacing: 2,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        // borderTopColor is set dynamically via dynamicStyles.statsRowBorder
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.h2,
        // color is applied dynamically via dynamicStyles.statValue
    },
    statDivider: {
        width: 1,
        height: 40,
        // backgroundColor is applied via dynamicStyles.statDivider
    },

    // Sections
    section: {
        gap: spacing.sm,
    },
    sectionLabel: {
        marginLeft: spacing.xs,
    },

    // Settings Card
    settingsCard: {
        overflow: 'hidden',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    settingsRowPressed: {
        // backgroundColor is applied dynamically via dynamicStyles.settingsRowPressed
    },
    settingsRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    settingsRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    settingsIcon: {
        fontSize: 20,
    },
    settingsLabel: {
        // color is applied dynamically via dynamicStyles.settingsLabel
        fontWeight: typography.fontWeight.medium,
    },
    settingsValue: {
        fontWeight: typography.fontWeight.bold,
    },
    settingsDivider: {
        height: 1,
        // backgroundColor is applied via dynamicStyles.settingsDivider
        marginHorizontal: spacing.lg,
    },
    chevron: {
        fontSize: 20,
        // color is applied dynamically via dynamicStyles.chevron
    },

    // Sign Out
    signOutButton: {
        backgroundColor: `${colors.error}1A`,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: `${colors.error}33`,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    signOutButtonPressed: {
        backgroundColor: `${colors.error}33`,
    },
    signOutText: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.semibold,
        color: colors.error,
    },

    // Version
    versionInfo: {
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
