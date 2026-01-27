/**
 * LegalDocumentsScreen - Privacy Policy and Terms of Service
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heading, Text as UIText } from '@/components/ui/Text';
import { useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';
import { spacing, radius } from '@/theme';
import { LEGAL_DOCUMENTS } from '@/constants/legalDocuments';

export function LegalDocumentsScreen() {
    const navigation = useNavigation();
    const themeColors = useThemeColors();

    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        headerBorder: { borderBottomColor: themeColors.border },
        title: { color: themeColors.textPrimary },
        backText: { color: themeColors.primary },
        card: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        paragraph: { color: themeColors.textSecondary },
        updatedText: { color: themeColors.textMuted },
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
                    Legal
                </Heading>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {LEGAL_DOCUMENTS.map(document => (
                    <View
                        key={document.key}
                        style={[styles.card, dynamicStyles.card]}
                    >
                        <Heading level={3} style={dynamicStyles.title}>
                            {document.title}
                        </Heading>
                        <UIText variant="caption" style={[styles.updatedAt, dynamicStyles.updatedText]}>
                            {document.updatedAt}
                        </UIText>
                        {document.paragraphs.map((paragraph, index) => (
                            <UIText
                                key={`${document.key}-paragraph-${index}`}
                                style={[styles.paragraph, dynamicStyles.paragraph]}
                            >
                                {paragraph}
                            </UIText>
                        ))}
                    </View>
                ))}
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
    card: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    updatedAt: {
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    paragraph: {
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
});
