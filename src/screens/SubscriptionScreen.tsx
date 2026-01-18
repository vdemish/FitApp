/**
 * ============================================================================
 * ЭКРАН ПОДПИСКИ (SubscriptionScreen)
 * ============================================================================
 * Заглушка с описанием Premium-функций
 * Кнопки: Upgrade, Restore, Cancel (все заглушки)
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

// Список Premium-функций
const PREMIUM_FEATURES = [
    {
        icon: '📊',
        title: 'Расширенная аналитика',
        description: 'Детальные графики прогресса и статистика по всем упражнениям',
    },
    {
        icon: '🎯',
        title: 'Персональные программы',
        description: 'ИИ-тренер составит программу под ваши цели',
    },
    {
        icon: '🔔',
        title: 'Умные напоминания',
        description: 'Персонализированные напоминания о тренировках',
    },
    {
        icon: '☁️',
        title: 'Облачная синхронизация',
        description: 'Данные на всех ваших устройствах',
    },
    {
        icon: '🏋️',
        title: 'Безлимитные тренировки',
        description: 'Никаких ограничений на количество тренировок',
    },
    {
        icon: '🎨',
        title: 'Темы оформления',
        description: 'Выберите тему, которая вам нравится',
    },
];

export function SubscriptionScreen({ navigation }: any) {
    const { profile } = useAuth();

    // Текущий статус подписки
    const isPremium = profile?.subscription_tier === 'premium';

    // Обработчик покупки
    const handleUpgrade = () => {
        Alert.alert(
            'Premium',
            'Покупка подписки пока недоступна. Скоро появится!',
            [{ text: 'OK' }]
        );
    };

    // Обработчик восстановления
    const handleRestore = () => {
        Alert.alert(
            'Восстановление',
            'Функция восстановления покупок будет доступна позже',
            [{ text: 'OK' }]
        );
    };

    // Обработчик отмены подписки
    const handleCancel = () => {
        Alert.alert(
            'Отмена подписки',
            'Для отмены подписки перейдите в настройки App Store или Google Play',
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
            {/* Шапка */}
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable
                    onPress={() => navigation.goBack()}
                    className="px-2 py-1"
                >
                    <Text className="text-primary text-base">← Назад</Text>
                </Pressable>
                <Text className="text-white text-lg font-bold">
                    Premium
                </Text>
                <View className="w-16" />
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Баннер статуса */}
                <View className={`rounded-2xl p-6 mb-6 ${isPremium
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                    <View className="items-center">
                        <Text className="text-4xl mb-3">{isPremium ? '👑' : '⭐'}</Text>
                        <Text className="text-white text-xl font-bold mb-1">
                            {isPremium ? 'Premium активен' : 'Перейдите на Premium'}
                        </Text>
                        <Text className="text-white/60 text-center">
                            {isPremium
                                ? 'Вы уже пользуетесь всеми преимуществами'
                                : 'Разблокируйте все возможности приложения'
                            }
                        </Text>
                    </View>
                </View>

                {/* Список функций */}
                <Text className="text-white/60 text-xs mb-4 uppercase tracking-wider">
                    Premium-функции
                </Text>

                <View className="bg-white/5 rounded-xl border border-white/10 mb-6">
                    {PREMIUM_FEATURES.map((feature, index) => (
                        <View key={feature.title}>
                            <View className="flex-row items-start px-4 py-4">
                                <Text className="text-2xl mr-4">{feature.icon}</Text>
                                <View className="flex-1">
                                    <Text className="text-white text-base font-semibold mb-1">
                                        {feature.title}
                                    </Text>
                                    <Text className="text-white/50 text-sm">
                                        {feature.description}
                                    </Text>
                                </View>
                                {isPremium && (
                                    <Text className="text-green-400 text-lg">✓</Text>
                                )}
                            </View>
                            {index < PREMIUM_FEATURES.length - 1 && (
                                <View className="h-px bg-white/10 mx-4" />
                            )}
                        </View>
                    ))}
                </View>

                {/* Кнопки */}
                <View className="gap-3 mb-8">
                    {!isPremium && (
                        <Pressable
                            onPress={handleUpgrade}
                            className="bg-primary rounded-xl py-4 items-center active:opacity-80"
                        >
                            <Text className="text-background-dark text-base font-bold">
                                Перейти на Premium — $9.99/мес
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleRestore}
                        className="bg-white/5 rounded-xl py-4 items-center border border-white/10 active:bg-white/10"
                    >
                        <Text className="text-white text-base">
                            Восстановить покупки
                        </Text>
                    </Pressable>

                    {isPremium && (
                        <Pressable
                            onPress={handleCancel}
                            className="py-4 items-center"
                        >
                            <Text className="text-red-400 text-sm">
                                Отменить подписку
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Юридическая информация */}
                <Text className="text-white/30 text-xs text-center mb-8 leading-5">
                    Подписка автоматически продлевается каждый месяц.{'\n'}
                    Вы можете отменить её в любое время через App Store или Google Play.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
