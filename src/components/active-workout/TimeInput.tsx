/**
 * TimeInput - A masked input for duration in MM:SS format
 * Stores value as total seconds internally
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColors } from '@/hooks';
import { typography, radius, spacing } from '@/theme';

interface TimeInputProps {
    /** Value in total seconds */
    value: number;
    /** Callback with value in seconds */
    onChange: (seconds: number) => void;
    /** Label displayed below the value */
    label?: string;
    /** Title for the modal header */
    title?: string;
    /** ID for testing */
    testID?: string;
}

/** Converts total seconds to { minutes, seconds } */
export function secondsToTime(totalSeconds: number): { minutes: number; seconds: number } {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}

/** Converts { minutes, seconds } to total seconds */
export function timeToSeconds(minutes: number, seconds: number): number {
    return minutes * 60 + seconds;
}

/** Formats seconds as MM:SS string */
export function formatDuration(totalSeconds: number): string {
    const { minutes, seconds } = secondsToTime(totalSeconds);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function TimeInput({
    value,
    onChange,
    label = 'TIME',
    title = 'Select Duration',
    testID,
}: TimeInputProps) {
    const themeColors = useThemeColors();
    const [visible, setVisible] = useState(false);

    // Local state for picker values
    const { minutes: initMinutes, seconds: initSeconds } = secondsToTime(value);
    const [tempMinutes, setTempMinutes] = useState(initMinutes);
    const [tempSeconds, setTempSeconds] = useState(initSeconds);

    // Generate picker items
    const minuteItems = useMemo(() => {
        const items = [];
        for (let m = 0; m <= 59; m++) {
            items.push({ label: m.toString().padStart(2, '0'), value: m });
        }
        return items;
    }, []);

    const secondItems = useMemo(() => {
        const items = [];
        for (let s = 0; s <= 59; s++) {
            items.push({ label: s.toString().padStart(2, '0'), value: s });
        }
        return items;
    }, []);

    const handleOpen = () => {
        const { minutes, seconds } = secondsToTime(value);
        setTempMinutes(minutes);
        setTempSeconds(seconds);
        setVisible(true);
    };

    const handleDone = () => {
        const totalSeconds = timeToSeconds(tempMinutes, tempSeconds);
        console.log('[TimeInput] handleDone:', { tempMinutes, tempSeconds, totalSeconds });
        onChange(totalSeconds);
        setVisible(false);
    };

    const displayValue = formatDuration(value);

    return (
        <>
            <TouchableOpacity
                testID={testID}
                onPress={handleOpen}
                style={[styles.trigger, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
            >
                <Text style={[styles.valueText, { color: themeColors.textPrimary }]}>
                    {displayValue}
                </Text>
                {label && (
                    <Text style={[styles.labelText, { color: themeColors.textMuted }]}>
                        {label}
                    </Text>
                )}
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={styles.backdrop} onPress={handleDone}>
                    <Pressable
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: themeColors.surface,
                                shadowColor: '#000',
                            }
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.headerButton, { color: themeColors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>

                            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{title}</Text>

                            <TouchableOpacity onPress={handleDone} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.headerButton, styles.doneButton, { color: themeColors.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dual Picker (Minutes : Seconds) */}
                        <View style={styles.pickerRow}>
                            <View style={styles.pickerColumn}>
                                <Picker
                                    selectedValue={tempMinutes}
                                    onValueChange={(val) => setTempMinutes(val)}
                                    itemStyle={{ color: themeColors.textPrimary, fontSize: 24 }}
                                    style={[styles.picker, { color: themeColors.textPrimary }]}
                                    testID={`${testID}-minutes`}
                                >
                                    {minuteItems.map((item) => (
                                        <Picker.Item
                                            key={item.value}
                                            label={item.label}
                                            value={item.value}
                                            color={themeColors.textPrimary}
                                        />
                                    ))}
                                </Picker>
                                <Text style={[styles.pickerLabel, { color: themeColors.textMuted }]}>min</Text>
                            </View>

                            <Text style={[styles.separator, { color: themeColors.textPrimary }]}>:</Text>

                            <View style={styles.pickerColumn}>
                                <Picker
                                    selectedValue={tempSeconds}
                                    onValueChange={(val) => setTempSeconds(val)}
                                    itemStyle={{ color: themeColors.textPrimary, fontSize: 24 }}
                                    style={[styles.picker, { color: themeColors.textPrimary }]}
                                    testID={`${testID}-seconds`}
                                >
                                    {secondItems.map((item) => (
                                        <Picker.Item
                                            key={item.value}
                                            label={item.label}
                                            value={item.value}
                                            color={themeColors.textPrimary}
                                        />
                                    ))}
                                </Picker>
                                <Text style={[styles.pickerLabel, { color: themeColors.textMuted }]}>sec</Text>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minWidth: 70,
        borderWidth: 1,
        borderRadius: radius.lg,
    },
    valueText: {
        fontSize: typography.fontSize.h2,
        fontWeight: typography.fontWeight.bold,
        fontVariant: ['tabular-nums'],
    },
    labelText: {
        fontSize: 10,
        textTransform: 'uppercase',
        marginTop: -2,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    headerButton: {
        fontSize: typography.fontSize.body,
    },
    doneButton: {
        fontWeight: typography.fontWeight.bold,
    },
    headerTitle: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.semibold,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 250,
    },
    pickerColumn: {
        flex: 1,
        alignItems: 'center',
    },
    picker: {
        width: '100%',
        height: 200,
    },
    pickerLabel: {
        fontSize: 12,
        marginTop: -10,
    },
    separator: {
        fontSize: 32,
        fontWeight: typography.fontWeight.bold,
    },
});
