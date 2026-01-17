/**
 * ProfileScreen - Профиль пользователя
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { colors, typography, spacing } from '@/theme';

export function ProfileScreen() {
    const { user, profile, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        </Text>
                    </View>

                    <Text style={styles.name}>
                        {profile?.full_name || 'Пользователь'}
                    </Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    <Pressable
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.signOutText}>Выйти</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.dark,
    },
    header: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    profileCard: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surface.dark,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border.dark,
        width: '100%',
        maxWidth: 320,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: colors.background.dark,
    },
    name: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary.dark,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: typography.fontSize.bodySm,
        color: colors.text.muted.dark,
        marginBottom: spacing.lg,
    },
    signOutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    signOutText: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.semibold,
        color: '#ef4444',
    },
});
