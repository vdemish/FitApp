/**
 * ============================================================================
 * SUPABASE CLIENT ДЛЯ REACT NATIVE
 * ============================================================================
 * 
 * Конфигурация клиента Supabase с AsyncStorage для персистентности сессии.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Получаем переменные окружения Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be defined in .env'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Используем AsyncStorage для хранения сессии в React Native
        storage: AsyncStorage,
        // Автоматическое обновление токенов
        autoRefreshToken: true,
        // Сохранение сессии между перезапусками приложения
        persistSession: true,
        // Отключаем определение URL (не нужно в React Native)
        detectSessionInUrl: false,
    },
});
