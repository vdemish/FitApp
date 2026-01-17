/**
 * LibraryScreen - Библиотека упражнений
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

export function LibraryScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Library</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>📚</Text>
                    <Text style={styles.placeholderText}>Library Screen</Text>
                    <Text style={styles.placeholderHint}>Будет реализован позже</Text>
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
    placeholder: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surface.dark,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border.dark,
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    placeholderText: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary.dark,
        marginBottom: spacing.xs,
    },
    placeholderHint: {
        fontSize: typography.fontSize.bodySm,
        color: colors.text.muted.dark,
    },
});
