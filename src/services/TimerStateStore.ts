import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimerStatus = 'running' | 'paused' | 'stopped';
export type TimerPhase = 'work' | 'rest';

export interface StoredTimerState {
    status: TimerStatus;
    phase: TimerPhase;
    endAtMs: number | null;
    remainingMs: number | null;
    durationMs: number | null;
    scheduledNotificationIds: string[];
    exerciseId?: string | null;
}

const REST_TIMER_STORAGE_KEY = '@fitapp/timers/rest';

export async function loadRestTimerState(): Promise<StoredTimerState | null> {
    try {
        const raw = await AsyncStorage.getItem(REST_TIMER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredTimerState;
    } catch (error) {
        console.error('[TimerStateStore] Failed to load rest timer state', error);
        return null;
    }
}

export async function saveRestTimerState(state: StoredTimerState): Promise<void> {
    try {
        await AsyncStorage.setItem(REST_TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('[TimerStateStore] Failed to save rest timer state', error);
    }
}

export async function updateRestTimerState(
    updates: Partial<StoredTimerState>
): Promise<void> {
    const existing = await loadRestTimerState();
    const next: StoredTimerState = {
        status: 'stopped',
        phase: 'rest',
        endAtMs: null,
        remainingMs: null,
        durationMs: null,
        scheduledNotificationIds: [],
        exerciseId: null,
        ...(existing ?? {}),
        ...updates,
    };
    await saveRestTimerState(next);
}

export async function clearRestTimerState(): Promise<void> {
    try {
        await AsyncStorage.removeItem(REST_TIMER_STORAGE_KEY);
    } catch (error) {
        console.error('[TimerStateStore] Failed to clear rest timer state', error);
    }
}
