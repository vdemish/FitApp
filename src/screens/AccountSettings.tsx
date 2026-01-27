/**
 * AccountSettings - Update email/password and delete account
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heading, Label, Input, Button } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { useThemeColors } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { triggerSelection } from '@/utils/haptics';
import { colors, spacing, radius } from '@/theme';

interface AccountSettingsFormState {
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function AccountSettings() {
    const navigation = useNavigation();
    const themeColors = useThemeColors();
    const { user, updateEmail, updatePassword, deleteAccount } = useAuth();

    const [formState, setFormState] = useState<AccountSettingsFormState>({
        email: user?.email ?? '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [emailLoading, setEmailLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        setFormState(prev => ({
            ...prev,
            email: user?.email ?? '',
        }));
    }, [user?.email]);

    const updateField = <K extends keyof AccountSettingsFormState>(key: K, value: AccountSettingsFormState[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdateEmail = async () => {
        if (!formState.email.trim()) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }

        if (!formState.email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setEmailLoading(true);
        try {
            await updateEmail(formState.email.trim());
            Alert.alert('Email Update', 'Check your inbox to confirm the new email.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update email.';
            Alert.alert('Error', message);
        } finally {
            setEmailLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!formState.currentPassword || !formState.newPassword) {
            Alert.alert('Error', 'Please fill out all password fields.');
            return;
        }

        if (formState.newPassword !== formState.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setPasswordLoading(true);
        try {
            await updatePassword(formState.currentPassword, formState.newPassword);
            setFormState(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
            Alert.alert('Password Update', 'Password updated successfully.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update password.';
            Alert.alert('Error', message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account?',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            await deleteAccount();
                        } catch (error) {
                            const message = error instanceof Error ? error.message : 'Failed to delete account.';
                            Alert.alert('Error', message);
                        } finally {
                            setDeleteLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        headerBorder: { borderBottomColor: themeColors.border },
        title: { color: themeColors.textPrimary },
        backText: { color: themeColors.primary },
        card: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        helperText: { color: themeColors.textSecondary },
        dangerCard: {
            backgroundColor: `${colors.error}1A`,
            borderColor: `${colors.error}33`,
        },
        dangerText: { color: colors.error },
    }), [themeColors]);

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <View style={[styles.header, dynamicStyles.headerBorder]}>
                <Pressable
                    onPress={() => {
                        triggerSelection();
                        navigation.goBack();
                    }}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <UIText variant="body-sm" style={dynamicStyles.backText}>
                        ← Back
                    </UIText>
                </Pressable>
                <Heading level={3} style={dynamicStyles.title}>
                    Account Settings
                </Heading>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>Email</Label>
                    <View style={[styles.card, dynamicStyles.card]}>
                        <Input
                            icon="mail"
                            placeholder="your@email.com"
                            value={formState.email}
                            onChangeText={(value) => updateField('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            testID="account-email-input"
                        />
                        <UIText variant="caption" style={[styles.helperText, dynamicStyles.helperText]}>
                            We will send a confirmation link to your new email.
                        </UIText>
                        <Button
                            fullWidth
                            onPress={handleUpdateEmail}
                            loading={emailLoading}
                            disabled={emailLoading}
                            testID="account-email-update"
                        >
                            Update Email
                        </Button>
                    </View>
                </View>

                <View style={styles.section}>
                    <Label style={styles.sectionLabel}>Password</Label>
                    <View style={[styles.card, dynamicStyles.card]}>
                        <Input
                            icon="lock"
                            placeholder="Current password"
                            value={formState.currentPassword}
                            onChangeText={(value) => updateField('currentPassword', value)}
                            autoCapitalize="none"
                            secureTextEntry
                            textContentType="password"
                            testID="account-current-password"
                        />
                        <Input
                            icon="lock"
                            placeholder="New password"
                            value={formState.newPassword}
                            onChangeText={(value) => updateField('newPassword', value)}
                            autoCapitalize="none"
                            secureTextEntry
                            textContentType="newPassword"
                            testID="account-new-password"
                        />
                        <Input
                            icon="lock"
                            placeholder="Confirm new password"
                            value={formState.confirmPassword}
                            onChangeText={(value) => updateField('confirmPassword', value)}
                            autoCapitalize="none"
                            secureTextEntry
                            textContentType="newPassword"
                            testID="account-confirm-password"
                        />
                        <Button
                            fullWidth
                            onPress={handleUpdatePassword}
                            loading={passwordLoading}
                            disabled={passwordLoading}
                            testID="account-password-update"
                        >
                            Update Password
                        </Button>
                    </View>
                </View>

                <View style={styles.section}>
                    <Label style={[styles.sectionLabel, styles.dangerLabel]}>Danger Zone</Label>
                    <View style={[styles.card, dynamicStyles.dangerCard]}>
                        <UIText variant="body-sm" style={[styles.helperText, dynamicStyles.dangerText]}>
                            Deleting your account is permanent and cannot be undone.
                        </UIText>
                        <Pressable
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.deleteButtonPressed,
                                deleteLoading && styles.deleteButtonDisabled,
                            ]}
                            onPress={handleDeleteAccount}
                            disabled={deleteLoading}
                            testID="delete-account-button"
                        >
                            <UIText variant="body-sm" style={[styles.deleteButtonText, dynamicStyles.dangerText]}>
                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                            </UIText>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        minWidth: 60,
    },
    headerSpacer: {
        width: 60,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        gap: spacing.lg,
        paddingBottom: spacing['2xl'],
    },
    section: {
        gap: spacing.sm,
    },
    sectionLabel: {
        marginLeft: spacing.xs,
    },
    dangerLabel: {
        color: colors.error,
    },
    card: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    helperText: {
        marginTop: -spacing.xs,
    },
    deleteButton: {
        backgroundColor: `${colors.error}1A`,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: `${colors.error}4D`,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    deleteButtonPressed: {
        backgroundColor: `${colors.error}33`,
    },
    deleteButtonDisabled: {
        opacity: 0.7,
    },
    deleteButtonText: {
        fontWeight: '600',
    },
});
