/**
 * ============================================================================
 * МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРОФИЛЯ (ProfileEditorModal)
 * ============================================================================
 * Позволяет редактировать: аватар, имя, цель тренировок, дата рождения, пол, вес, рост
 * Локальное обновление через AuthContext
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { colors, spacing, typography, radius } from '@/theme';
import type { Gender, TrainingGoal } from '@/types/auth';

// ============================================================================
// ТИПЫ
// ============================================================================

interface ProfileEditorModalProps {
    visible: boolean;
    onClose: () => void;
}

interface ProfileFormState {
    full_name: string;
    age: number | null;
    gender: Gender | null;
    training_goal: TrainingGoal | null;
    current_weight_kg: number | null;
    current_height_cm: number | null;
}

// Опции для выбора пола
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// Опции для выбора цели тренировок
const TRAINING_GOAL_OPTIONS: { value: TrainingGoal; label: string }[] = [
    { value: 'lose_weight', label: 'Lose weight' },
    { value: 'build_muscle', label: 'Build muscle' },
    { value: 'maintain', label: 'Maintain' },
    { value: 'improve_endurance', label: 'Improve endurance' },
    { value: 'general_fitness', label: 'General fitness' },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export function ProfileEditorModal({ visible, onClose }: ProfileEditorModalProps) {
    const { profile, updateProfile } = useAuth();
    const themeColors = useThemeColors();

    // Ref для отслеживания инициализации формы
    const wasInitialized = useRef(false);

    // Локальное состояние формы
    const [formData, setFormData] = useState<ProfileFormState>({
        full_name: '',
        age: null,
        gender: null,
        training_goal: null,
        current_weight_kg: null,
        current_height_cm: null,
    });
    const [saving, setSaving] = useState(false);

    // Инициализация формы при открытии модалки
    useEffect(() => {
        // Инициализируем только при открытии модалки
        if (visible && profile && !wasInitialized.current) {
            wasInitialized.current = true;
            setFormData({
                full_name: profile.full_name || '',
                age: profile.age ?? null,
                gender: profile.gender ?? null,
                training_goal: profile.training_goal ?? null,
                current_weight_kg: profile.current_weight_kg ?? null,
                current_height_cm: profile.current_height_cm ?? null,
            });
        }

        // Сбрасываем флаг при закрытии модалки
        if (!visible) {
            wasInitialized.current = false;
        }
    }, [visible, profile?.id]); // Зависимость только от visible и profile.id

    // Обработчик сохранения
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(formData);
            Alert.alert('Success', 'Profile updated.');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    // Обновление поля формы
    const updateField = <K extends keyof ProfileFormState>(
        field: K,
        value: ProfileFormState[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const ageLabel = formData.age ? `${formData.age}` : 'Select age';
    const genderLabel = GENDER_OPTIONS.find(option => option.value === formData.gender)?.label ?? 'Select gender';

    const dynamicStyles = {
        screen: { backgroundColor: themeColors.background },
        headerBorder: { borderBottomColor: themeColors.border },
        headerTitle: { color: themeColors.textPrimary },
        headerAction: { color: themeColors.primary },
        card: { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        label: { color: themeColors.textSecondary },
        selectionText: { color: themeColors.textPrimary },
        selectionField: { borderColor: themeColors.border, backgroundColor: themeColors.background },
        helperText: { color: themeColors.textMuted },
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.screen, dynamicStyles.screen]}
            >
                <View style={[styles.header, dynamicStyles.headerBorder]}>
                    <Pressable onPress={onClose} style={styles.headerButton} hitSlop={styles.headerHitSlop}>
                        <Text style={[styles.headerAction, dynamicStyles.headerAction]}>Cancel</Text>
                    </Pressable>
                    <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
                        Edit profile
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, dynamicStyles.card]}>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Full name
                        </Text>
                            <Input
                                value={formData.full_name}
                                onChangeText={(text) => updateField('full_name', text)}
                                placeholder="Enter your name"
                                textContentType="name"
                                autoCapitalize="words"
                                containerStyle={styles.inputContainer}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Age
                        </Text>
                            <AgePicker
                                label={ageLabel}
                                value={formData.age}
                                onChange={(value) => updateField('age', value)}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Gender
                        </Text>
                            <WheelSelect
                                label={genderLabel}
                                value={formData.gender}
                                title="Select gender"
                                items={GENDER_OPTIONS}
                                onChange={(value) => updateField('gender', value)}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Training goal
                        </Text>
                            <View style={styles.pills}>
                                {TRAINING_GOAL_OPTIONS.map((option) => (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => updateField('training_goal', option.value)}
                                        style={[
                                            styles.pill,
                                            dynamicStyles.selectionRow,
                                            formData.training_goal === option.value && styles.pillActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.pillText,
                                                dynamicStyles.selectionText,
                                                formData.training_goal === option.value && styles.pillTextActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Weight (kg)
                        </Text>
                            <Input
                                value={formData.current_weight_kg?.toString() ?? ''}
                                onChangeText={(text) => {
                                    const num = parseFloat(text.replace(',', '.'));
                                    updateField('current_weight_kg', isNaN(num) ? null : num);
                                }}
                                placeholder="Enter your weight"
                                keyboardType="decimal-pad"
                                containerStyle={styles.inputContainer}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, dynamicStyles.label]}>
                                Height (cm)
                        </Text>
                            <Input
                                value={formData.current_height_cm?.toString() ?? ''}
                                onChangeText={(text) => {
                                    const num = parseFloat(text.replace(',', '.'));
                                    updateField('current_height_cm', isNaN(num) ? null : num);
                                }}
                                placeholder="Enter your height"
                                keyboardType="decimal-pad"
                                containerStyle={styles.inputContainer}
                            />
                        </View>

                        <View style={styles.footer}>
                            <Button
                                fullWidth
                                onPress={handleSave}
                                loading={saving}
                                disabled={saving}
                                testID="profile-save-button"
                            >
                                Save
                            </Button>
                            <Text style={[styles.helperText, dynamicStyles.helperText]}>
                                Changes are saved to your profile.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    screen: {
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
    headerButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    headerHitSlop: {
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
    },
    headerAction: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.medium,
    },
    headerTitle: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
    },
    headerSpacer: {
        width: 64,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 520,
        borderRadius: radius.card,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.lg,
    },
    field: {
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        marginBottom: 0,
    },
    selectionField: {
        borderRadius: radius.lg,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    selectionText: {
        fontSize: typography.fontSize.body,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    pill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: `${colors.primary.DEFAULT}33`,
    },
    pillActive: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
    },
    pillText: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.medium,
    },
    pillTextActive: {
        color: colors.background.dark,
        fontWeight: typography.fontWeight.bold,
    },
    footer: {
        gap: spacing.sm,
        paddingTop: spacing.sm,
    },
    helperText: {
        fontSize: typography.fontSize.caption,
        textAlign: 'center',
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
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    headerButtonText: {
        fontSize: typography.fontSize.body,
    },
    headerDoneText: {
        fontWeight: typography.fontWeight.bold,
    },
    headerTitleSmall: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.semibold,
    },
    pickerContainer: {
        height: 250,
        justifyContent: 'center',
    },
});

interface WheelSelectItem<T extends string> {
    value: T;
    label: string;
}

interface WheelSelectProps<T extends string> {
    label: string;
    value: T | null;
    title: string;
    items: WheelSelectItem<T>[];
    onChange: (value: T) => void;
}

function WheelSelect<T extends string>({ label, value, title, items, onChange }: WheelSelectProps<T>) {
    const themeColors = useThemeColors();
    const [visible, setVisible] = useState(false);
    const [tempValue, setTempValue] = useState<T>((value ?? items[0]?.value) as T);

    const handleOpen = () => {
        setTempValue((value ?? items[0]?.value) as T);
        setVisible(true);
    };

    const handleDone = () => {
        onChange(tempValue);
        setVisible(false);
    };

    return (
        <>
            <Pressable
                onPress={handleOpen}
                style={[styles.selectionField, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
            >
                <Text style={[styles.selectionText, { color: themeColors.textPrimary }]}>{label}</Text>
            </Pressable>

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
                        <View style={[styles.pickerHeader, { borderBottomColor: themeColors.border }]}>
                            <Pressable onPress={() => setVisible(false)} hitSlop={styles.headerHitSlop}>
                                <Text style={[styles.headerButtonText, { color: themeColors.textSecondary }]}>Cancel</Text>
                            </Pressable>
                            <Text style={[styles.headerTitleSmall, { color: themeColors.textPrimary }]}>{title}</Text>
                            <Pressable onPress={handleDone} hitSlop={styles.headerHitSlop}>
                                <Text style={[styles.headerButtonText, styles.headerDoneText, { color: themeColors.primary }]}>Done</Text>
                            </Pressable>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tempValue}
                                onValueChange={(itemValue) => setTempValue(itemValue as T)}
                                itemStyle={{ color: themeColors.textPrimary, fontSize: 24 }}
                                style={{ color: themeColors.textPrimary }}
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

interface AgePickerProps {
    label: string;
    value: number | null;
    onChange: (value: number) => void;
}

function AgePicker({ label, value, onChange }: AgePickerProps) {
    const themeColors = useThemeColors();
    const [visible, setVisible] = useState(false);
    const [tempAge, setTempAge] = useState(value ?? 25);
    const ageItems = [];
    for (let age = 13; age <= 90; age += 1) {
        ageItems.push({ label: age.toString(), value: age });
    }

    const handleOpen = () => {
        setTempAge(value ?? 25);
        setVisible(true);
    };

    const handleDone = () => {
        onChange(tempAge);
        setVisible(false);
    };

    return (
        <>
            <Pressable
                onPress={handleOpen}
                style={[styles.selectionField, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
            >
                <Text style={[styles.selectionText, { color: themeColors.textPrimary }]}>{label}</Text>
            </Pressable>

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
                        <View style={[styles.pickerHeader, { borderBottomColor: themeColors.border }]}>
                            <Pressable onPress={() => setVisible(false)} hitSlop={styles.headerHitSlop}>
                                <Text style={[styles.headerButtonText, { color: themeColors.textSecondary }]}>Cancel</Text>
                            </Pressable>
                            <Text style={[styles.headerTitleSmall, { color: themeColors.textPrimary }]}>Select age</Text>
                            <Pressable onPress={handleDone} hitSlop={styles.headerHitSlop}>
                                <Text style={[styles.headerButtonText, styles.headerDoneText, { color: themeColors.primary }]}>Done</Text>
                            </Pressable>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tempAge}
                                onValueChange={(val) => setTempAge(val)}
                                itemStyle={{ color: themeColors.textPrimary, fontSize: 24 }}
                                style={{ color: themeColors.textPrimary }}
                            >
                                {ageItems.map((item) => (
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
