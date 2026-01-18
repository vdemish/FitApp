/**
 * ============================================================================
 * МОДАЛЬНОЕ ОКНО НАСТРОЕК ПРИЛОЖЕНИЯ (AppSettingsModal)
 * ============================================================================
 * Содержит: уведомления, смена email, сброс пароля, удаление аккаунта
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

// ============================================================================
// ТИПЫ
// ============================================================================

interface AppSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export function AppSettingsModal({ visible, onClose }: AppSettingsModalProps) {
    const { user, updateEmail, resetPassword, deleteAccount } = useAuth();

    // Состояние для формы смены email
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    // Состояние для уведомлений (заглушка)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [remindersEnabled, setRemindersEnabled] = useState(true);

    // Обработчик смены email
    const handleChangeEmail = async () => {
        if (!newEmail.trim()) {
            Alert.alert('Ошибка', 'Введите новый email');
            return;
        }

        if (!newEmail.includes('@')) {
            Alert.alert('Ошибка', 'Введите корректный email');
            return;
        }

        setEmailLoading(true);
        try {
            await updateEmail(newEmail);
            Alert.alert(
                'Успешно',
                'Ссылка для подтверждения отправлена на новый email'
            );
            setNewEmail('');
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось обновить email');
        } finally {
            setEmailLoading(false);
        }
    };

    // Обработчик сброса пароля
    const handleResetPassword = async () => {
        Alert.alert(
            'Сброс пароля',
            `Ссылка для сброса пароля будет отправлена на ${user?.email}`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Отправить',
                    onPress: async () => {
                        try {
                            await resetPassword();
                            Alert.alert('Успешно', 'Письмо для сброса пароля отправлено');
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось отправить письмо');
                        }
                    },
                },
            ]
        );
    };

    // Обработчик удаления аккаунта
    const handleDeleteAccount = () => {
        Alert.alert(
            'Удалить аккаунт?',
            'Это действие нельзя отменить. Все ваши данные будут удалены.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                            // После удаления пользователь будет перенаправлен на экран входа
                        } catch (error) {
                            Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Шапка модального окна */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-white/10">
                    <View className="w-16" />
                    <Text className="text-slate-900 dark:text-white text-lg font-bold">
                        Настройки
                    </Text>
                    <Pressable onPress={onClose} className="w-16 items-end">
                        <Text className="text-primary text-base">Готово</Text>
                    </Pressable>
                </View>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Секция: Уведомления */}
                    <View className="mb-6">
                        <Text className="text-slate-500 dark:text-white/60 text-xs mb-3 uppercase tracking-wider">
                            Уведомления
                        </Text>
                        <View className="bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                            {/* Push-уведомления */}
                            <View className="flex-row items-center justify-between px-4 py-3">
                                <Text className="text-slate-900 dark:text-white text-base">
                                    Push-уведомления
                                </Text>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ false: colors.input.track.false, true: colors.input.track.true }}
                                    thumbColor={colors.input.thumb}
                                />
                            </View>
                            <View className="h-px bg-slate-200 dark:bg-white/10 mx-4" />
                            {/* Напоминания о тренировках */}
                            <View className="flex-row items-center justify-between px-4 py-3">
                                <Text className="text-slate-900 dark:text-white text-base">
                                    Напоминания о тренировках
                                </Text>
                                <Switch
                                    value={remindersEnabled}
                                    onValueChange={setRemindersEnabled}
                                    trackColor={{ false: colors.input.track.false, true: colors.input.track.true }}
                                    thumbColor={colors.input.thumb}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Секция: Изменить Email */}
                    <View className="mb-6">
                        <Text className="text-slate-500 dark:text-white/60 text-xs mb-3 uppercase tracking-wider">
                            Изменить Email
                        </Text>
                        <View className="bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 p-4">
                            <Text className="text-slate-400 dark:text-white/40 text-sm mb-2">
                                Текущий: {user?.email}
                            </Text>
                            <TextInput
                                value={newEmail}
                                onChangeText={setNewEmail}
                                placeholder="Новый email"
                                placeholderTextColor={colors.text.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-white dark:bg-white/5 rounded-lg px-4 py-3 text-slate-900 dark:text-white text-base border border-slate-200 dark:border-white/10 mb-3"
                            />
                            <Pressable
                                onPress={handleChangeEmail}
                                disabled={emailLoading}
                                className="bg-primary rounded-lg py-3 items-center"
                            >
                                {emailLoading ? (
                                    <ActivityIndicator size="small" color={colors.background.dark} />
                                ) : (
                                    <Text className="text-background-light dark:text-background-dark font-bold text-base">
                                        Обновить Email
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {/* Секция: Безопасность */}
                    <View className="mb-6">
                        <Text className="text-slate-500 dark:text-white/60 text-xs mb-3 uppercase tracking-wider">
                            Безопасность
                        </Text>
                        <View className="bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                            <Pressable
                                onPress={handleResetPassword}
                                className="px-4 py-4 active:bg-slate-200 dark:active:bg-white/10"
                            >
                                <Text className="text-slate-900 dark:text-white text-base">
                                    Сбросить пароль
                                </Text>
                                <Text className="text-slate-400 dark:text-white/40 text-sm mt-1">
                                    Отправить письмо для сброса пароля
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Секция: Опасная зона */}
                    <View className="mb-6">
                        <Text className="text-red-400/60 text-xs mb-3 uppercase tracking-wider">
                            Опасная зона
                        </Text>
                        <View className="bg-red-500/10 rounded-xl overflow-hidden border border-red-500/20">
                            <Pressable
                                onPress={handleDeleteAccount}
                                testID="delete-account-button"
                                className="px-4 py-4 active:bg-red-500/20"
                            >
                                <Text className="text-red-400 text-base font-semibold">
                                    Удалить аккаунт
                                </Text>
                                <Text className="text-red-400/60 text-sm mt-1">
                                    Все данные будут безвозвратно удалены
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Отступ снизу */}
                    <View className="h-24" />
                </ScrollView>
            </View>
        </Modal>
    );
}
