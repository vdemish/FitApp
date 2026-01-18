/**
 * ============================================================================
 * КОНТЕКСТ НАСТРОЕК ПРИЛОЖЕНИЯ (SETTINGS CONTEXT)
 * ============================================================================
 * Управляет настройками: тема, единицы измерения, звуки таймера
 * Сохраняет настройки в AsyncStorage для персистентности
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

// ============================================================================
// ТИПЫ
// ============================================================================

/** Тип единиц измерения */
export type UnitSystem = 'metric' | 'imperial';

/** Тип темы приложения */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Состояние настроек */
export interface SettingsState {
    /** Текущая тема */
    theme: ThemeMode;
    /** Единицы измерения (metric: kg/cm, imperial: lbs/in) */
    units: UnitSystem;
    /** Включены ли звуки таймера отдыха */
    restTimerSounds: boolean;
    /** Загрузка настроек */
    loading: boolean;
}

/** Тип контекста настроек */
export interface SettingsContextType extends SettingsState {
    /** Установить тему */
    setTheme: (theme: ThemeMode) => Promise<void>;
    /** Установить единицы измерения */
    setUnits: (units: UnitSystem) => Promise<void>;
    /** Переключить звуки таймера */
    toggleRestTimerSounds: () => Promise<void>;
    /** Текущая активная тема (учитывая system) */
    activeTheme: 'light' | 'dark';
}

// ============================================================================
// КЛЮЧИ ASYNCSTORAGE
// ============================================================================

const STORAGE_KEYS = {
    THEME: '@fitapp/settings/theme',
    UNITS: '@fitapp/settings/units',
    REST_TIMER_SOUNDS: '@fitapp/settings/restTimerSounds',
} as const;

// ============================================================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ============================================================================

const initialState: SettingsState = {
    theme: 'dark',
    units: 'metric',
    restTimerSounds: true,
    loading: true,
};

// ============================================================================
// СОЗДАНИЕ КОНТЕКСТА
// ============================================================================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ============================================================================
// ПРОВАЙДЕР
// ============================================================================

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [state, setState] = useState<SettingsState>(initialState);

    // Получаем системную тему через React Native
    const systemColorScheme = useColorScheme();

    // NativeWind colorScheme для синхронизации Tailwind dark: классов
    const { setColorScheme } = useNativeWindColorScheme();

    // Загрузка настроек из AsyncStorage при монтировании
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [themeValue, unitsValue, soundsValue] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.THEME),
                    AsyncStorage.getItem(STORAGE_KEYS.UNITS),
                    AsyncStorage.getItem(STORAGE_KEYS.REST_TIMER_SOUNDS),
                ]);

                const loadedTheme = (themeValue as ThemeMode) || 'dark';

                // Синхронизируем NativeWind с загруженной темой
                setColorScheme(loadedTheme);

                setState({
                    theme: loadedTheme,
                    units: (unitsValue as UnitSystem) || 'metric',
                    restTimerSounds: soundsValue !== 'false', // По умолчанию true
                    loading: false,
                });
            } catch (error) {
                console.error('[SettingsContext] Ошибка загрузки настроек:', error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Установка темы
    const setTheme = useCallback(async (theme: ThemeMode) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);

            // Синхронизируем NativeWind colorScheme
            setColorScheme(theme);

            setState(prev => ({ ...prev, theme }));
        } catch (error) {
            console.error('[SettingsContext] Ошибка сохранения темы:', error);
        }
    }, [setColorScheme]);

    // Установка единиц измерения
    const setUnits = useCallback(async (units: UnitSystem) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.UNITS, units);
            setState(prev => ({ ...prev, units }));
        } catch (error) {
            console.error('[SettingsContext] Ошибка сохранения единиц:', error);
        }
    }, []);

    // Переключение звуков таймера
    const toggleRestTimerSounds = useCallback(async () => {
        try {
            const newValue = !state.restTimerSounds;
            await AsyncStorage.setItem(STORAGE_KEYS.REST_TIMER_SOUNDS, String(newValue));
            setState(prev => ({ ...prev, restTimerSounds: newValue }));
        } catch (error) {
            console.error('[SettingsContext] Ошибка сохранения звуков:', error);
        }
    }, [state.restTimerSounds]);

    // Определяем активную тему с учётом system
    const activeTheme = useMemo(() => {
        if (state.theme === 'system') {
            return systemColorScheme || 'dark';
        }
        return state.theme;
    }, [state.theme, systemColorScheme]);

    // Мемоизированное значение контекста
    const value = useMemo<SettingsContextType>(() => ({
        ...state,
        setTheme,
        setUnits,
        toggleRestTimerSounds,
        activeTheme,
    }), [state, setTheme, setUnits, toggleRestTimerSounds, activeTheme]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

// ============================================================================
// ХУК useSettings
// ============================================================================

/**
 * Хук для доступа к настройкам приложения
 */
export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);

    if (context === undefined) {
        throw new Error(
            '[useSettings] Хук должен использоваться внутри <SettingsProvider>.'
        );
    }

    return context;
}
