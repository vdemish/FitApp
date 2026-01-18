/**
 * Input - Стилизованное текстовое поле ввода
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    /** Имя иконки Material Symbols */
    icon?: string;
    /** Текст ошибки */
    error?: string;
    /** Дополнительные стили контейнера */
    containerStyle?: ViewStyle;
    /** ID для тестирования */
    testID?: string;
}

export function Input({
    icon,
    error,
    containerStyle,
    testID,
    editable = true,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyles: ViewStyle[] = [
        styles.container,
        isFocused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
        containerStyle,
    ].filter(Boolean) as ViewStyle[];

    return (
        <View style={containerStyles} testID={testID}>
            {icon && (
                <Text style={styles.icon}>{getIconEmoji(icon)}</Text>
            )}
            <TextInput
                style={styles.input}
                placeholderTextColor={colors.text.muted.dark}
                editable={editable}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                {...props}
            />
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

// Временный маппинг иконок (позже заменить на react-native-vector-icons)
function getIconEmoji(icon: string): string {
    const iconMap: Record<string, string> = {
        mail: '✉️',
        lock: '🔒',
        person: '👤',
        search: '🔍',
    };
    return iconMap[icon] || '•';
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        backgroundColor: colors.surface.dark,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.dark,
        paddingHorizontal: spacing.md,
    },
    focused: {
        borderColor: colors.primary.DEFAULT,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.error,
    },
    disabled: {
        opacity: 0.5,
    },
    icon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.body,
        color: colors.text.primary.dark,
        paddingVertical: 0, // Убираем вертикальный padding для Android
    },
    errorText: {
        position: 'absolute',
        bottom: -20,
        left: spacing.md,
        fontSize: typography.fontSize.caption,
        color: colors.error,
    },
});
