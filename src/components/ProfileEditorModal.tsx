/**
 * ============================================================================
 * МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРОФИЛЯ (ProfileEditorModal)
 * ============================================================================
 * Позволяет редактировать: аватар, имя, цель тренировок, возраст, пол, вес, рост
 * Синхронизация с Supabase через AuthContext
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';
import type { ProfileUpdateData, Gender, TrainingGoal } from '@/types/auth';

// ============================================================================
// ТИПЫ
// ============================================================================

interface ProfileEditorModalProps {
    visible: boolean;
    onClose: () => void;
}

// Опции для выбора пола
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'other', label: 'Другой' },
    { value: 'prefer_not_to_say', label: 'Не указывать' },
];

// Опции для выбора цели тренировок
const TRAINING_GOAL_OPTIONS: { value: TrainingGoal; label: string }[] = [
    { value: 'lose_weight', label: 'Похудение' },
    { value: 'build_muscle', label: 'Набор мышц' },
    { value: 'maintain', label: 'Поддержание формы' },
    { value: 'improve_endurance', label: 'Выносливость' },
    { value: 'general_fitness', label: 'Общий фитнес' },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export function ProfileEditorModal({ visible, onClose }: ProfileEditorModalProps) {
    const { profile, updateProfile, loading } = useAuth();

    // Ref для отслеживания инициализации формы
    const wasInitialized = useRef(false);

    // Локальное состояние формы
    const [formData, setFormData] = useState<ProfileUpdateData>({
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
                age: profile.age,
                gender: profile.gender,
                training_goal: profile.training_goal,
                current_weight_kg: profile.current_weight_kg,
                current_height_cm: profile.current_height_cm,
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
            Alert.alert('Успешно', 'Профиль обновлён');
            onClose();
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось сохранить профиль');
        } finally {
            setSaving(false);
        }
    };

    // Обновление поля формы
    const updateField = <K extends keyof ProfileUpdateData>(
        field: K,
        value: ProfileUpdateData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                className="flex-1 bg-background-dark"
            >
                {/* Шапка модального окна */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
                    <Pressable onPress={onClose} className="px-2 py-1">
                        <Text className="text-primary text-base">Отмена</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">
                        Редактировать профиль
                    </Text>
                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className="px-2 py-1"
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                        ) : (
                            <Text className="text-primary text-base font-semibold">
                                Сохранить
                            </Text>
                        )}
                    </Pressable>
                </View>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Аватар (заглушка) */}
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-2">
                            <Text className="text-background-dark text-3xl font-bold">
                                {formData.full_name?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <Pressable className="py-2">
                            <Text className="text-primary text-sm">
                                Изменить фото
                            </Text>
                        </Pressable>
                    </View>

                    {/* Поле: Имя */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Имя
                        </Text>
                        <TextInput
                            value={formData.full_name || ''}
                            onChangeText={(text) => updateField('full_name', text)}
                            placeholder="Введите имя"
                            placeholderTextColor={colors.text.placeholder}
                            className="bg-white/5 rounded-xl px-4 py-3 text-white text-base border border-white/10"
                        />
                    </View>

                    {/* Поле: Возраст */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Возраст
                        </Text>
                        <TextInput
                            value={formData.age?.toString() || ''}
                            onChangeText={(text) => {
                                const num = parseInt(text, 10);
                                updateField('age', isNaN(num) ? null : num);
                            }}
                            placeholder="Ваш возраст"
                            placeholderTextColor={colors.text.placeholder}
                            keyboardType="number-pad"
                            className="bg-white/5 rounded-xl px-4 py-3 text-white text-base border border-white/10"
                        />
                    </View>

                    {/* Поле: Пол */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Пол
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {GENDER_OPTIONS.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => updateField('gender', option.value)}
                                    className={`px-4 py-2 rounded-lg border ${formData.gender === option.value
                                        ? 'bg-primary border-primary'
                                        : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <Text
                                        className={`text-sm ${formData.gender === option.value
                                            ? 'text-background-dark font-bold'
                                            : 'text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Поле: Цель тренировок */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Цель тренировок
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {TRAINING_GOAL_OPTIONS.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => updateField('training_goal', option.value)}
                                    className={`px-4 py-2 rounded-lg border ${formData.training_goal === option.value
                                        ? 'bg-primary border-primary'
                                        : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <Text
                                        className={`text-sm ${formData.training_goal === option.value
                                            ? 'text-background-dark font-bold'
                                            : 'text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Поле: Вес */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Вес (кг)
                        </Text>
                        <TextInput
                            value={formData.current_weight_kg?.toString() || ''}
                            onChangeText={(text) => {
                                const num = parseFloat(text.replace(',', '.'));
                                updateField('current_weight_kg', isNaN(num) ? null : num);
                            }}
                            placeholder="Ваш вес"
                            placeholderTextColor={colors.text.placeholder}
                            keyboardType="decimal-pad"
                            className="bg-white/5 rounded-xl px-4 py-3 text-white text-base border border-white/10"
                        />
                    </View>

                    {/* Поле: Рост */}
                    <View className="mb-4">
                        <Text className="text-white/60 text-sm mb-2 uppercase tracking-wider">
                            Рост (см)
                        </Text>
                        <TextInput
                            value={formData.current_height_cm?.toString() || ''}
                            onChangeText={(text) => {
                                const num = parseFloat(text.replace(',', '.'));
                                updateField('current_height_cm', isNaN(num) ? null : num);
                            }}
                            placeholder="Ваш рост"
                            placeholderTextColor={colors.text.placeholder}
                            keyboardType="decimal-pad"
                            className="bg-white/5 rounded-xl px-4 py-3 text-white text-base border border-white/10"
                        />
                    </View>

                    {/* Отступ снизу */}
                    <View className="h-24" />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}
