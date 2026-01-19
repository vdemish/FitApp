import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColors } from '@/hooks';
import { PickerItem } from './pickerData';
import { colors, typography, radius, spacing } from '@/theme';

interface WheelInputProps {
    value: number;
    onChange: (value: number) => void;
    items: PickerItem[];
    label?: string; // e.g. "kg" or "reps" - displayed in the button
    title?: string; // Title for the modal header
    testID?: string;
}

export function WheelInput({
    value,
    onChange,
    items,
    label,
    title,
    testID,
}: WheelInputProps) {
    const themeColors = useThemeColors();
    const [visible, setVisible] = useState(false);

    // Local state for the picker value while it's open
    const [tempValue, setTempValue] = useState(value.toString());

    const handleOpen = () => {
        setTempValue(value.toString());
        setVisible(true);
    };

    const handleDone = () => {
        onChange(parseFloat(tempValue));
        setVisible(false);
    };

    const handleChange = (itemValue: string) => {
        setTempValue(itemValue);
    };

    const displayValue = value.toString();

    // Use a minimal text-based look as requested ("look like text/values")
    // Similar to iOS Clock app: just the number, maybe slightly larger/bold
    return (
        <>
            <TouchableOpacity
                testID={testID}
                onPress={handleOpen}
                style={[styles.trigger, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
            >
                <Text
                    style={[styles.valueText, { color: themeColors.textPrimary }]}
                >
                    {label === 'KG' ? parseFloat(displayValue).toFixed(1) : displayValue}
                </Text>
                {label && (
                    <Text
                        style={[styles.labelText, { color: themeColors.textMuted }]}
                    >
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
                <Pressable
                    style={styles.backdrop}
                    onPress={handleDone} // Save on backdrop press
                >
                    <Pressable
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: themeColors.surface,
                                shadowColor: '#000',
                            }
                        ]}
                        onPress={(e) => e.stopPropagation()} // Prevent closing when tapping modal content
                    >
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
                                <Text style={[styles.headerButton, { color: themeColors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>

                            {title && (
                                <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{title}</Text>
                            )}

                            <TouchableOpacity onPress={handleDone} hitSlop={10}>
                                <Text style={[styles.headerButton, styles.doneButton, { color: themeColors.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Picker */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tempValue}
                                onValueChange={(itemValue) => handleChange(itemValue)}
                                itemStyle={{ color: themeColors.textPrimary, fontSize: 24 }}
                                style={{ color: themeColors.textPrimary }} // Android text color
                                testID={`${testID} -picker`}
                            >
                                {items.map((item) => (
                                    <Picker.Item
                                        key={item.value}
                                        label={item.label}
                                        value={item.value}
                                        color={themeColors.textPrimary}
                                    />
                                ))}
                            </Picker>
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
        fontSize: typography.fontSize.h2, // Changed to h2 (24) for better visibility
        fontWeight: typography.fontWeight.bold,
        fontVariant: ['tabular-nums'], // Fixed width numbers to prevent jumping
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
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Safe area padding simulation
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
    pickerContainer: {
        height: 250,
        justifyContent: 'center',
    },
});
