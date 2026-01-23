import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrefillSetValues {
    weight: number;
    reps: number;
    distance?: number;
    durationSeconds?: number;
}

export interface ExercisePrefillEntry {
    exerciseId: string;
    sets: PrefillSetValues[];
}

export interface TemplatePrefillItem {
    exerciseId: string;
    sortOrder: number;
    sets: PrefillSetValues[];
}

interface ExercisePrefillPayload {
    exerciseId: string;
    updatedAt: string;
    sets: PrefillSetValues[];
}

interface TemplatePrefillPayload {
    templateId: string;
    updatedAt: string;
    items: TemplatePrefillItem[];
}

function exercisePrefillKey(userId: string, exerciseId: string): string {
    return `prefill:exercise:${userId}:${exerciseId}`;
}

function templatePrefillKey(userId: string, templateId: string): string {
    return `prefill:template:${userId}:${templateId}`;
}

export async function saveExercisePrefills(
    userId: string,
    entries: ExercisePrefillEntry[]
): Promise<void> {
    if (!entries.length) return;

    const now = new Date().toISOString();
    const pairs: [string, string][] = entries.map((entry) => [
        exercisePrefillKey(userId, entry.exerciseId),
        JSON.stringify({
            exerciseId: entry.exerciseId,
            updatedAt: now,
            sets: entry.sets,
        } as ExercisePrefillPayload),
    ]);

    await AsyncStorage.multiSet(pairs);
}

export async function loadExercisePrefills(
    userId: string,
    exerciseIds: string[]
): Promise<Map<string, PrefillSetValues[]>> {
    const result = new Map<string, PrefillSetValues[]>();
    if (!exerciseIds.length) return result;

    const keys = exerciseIds.map((id) => exercisePrefillKey(userId, id));
    const pairs = await AsyncStorage.multiGet(keys);

    pairs.forEach(([, value]) => {
        if (!value) return;
        try {
            const parsed = JSON.parse(value) as ExercisePrefillPayload;
            if (!parsed?.exerciseId) return;
            result.set(parsed.exerciseId, parsed.sets || []);
        } catch (error) {
            console.error('[workoutPrefillService] Failed to parse exercise prefill:', error);
        }
    });

    return result;
}

export async function saveTemplatePrefill(
    userId: string,
    templateId: string,
    items: TemplatePrefillItem[]
): Promise<void> {
    const payload: TemplatePrefillPayload = {
        templateId,
        updatedAt: new Date().toISOString(),
        items,
    };

    await AsyncStorage.setItem(templatePrefillKey(userId, templateId), JSON.stringify(payload));
}

export async function loadTemplatePrefill(
    userId: string,
    templateId: string
): Promise<TemplatePrefillItem[] | null> {
    const raw = await AsyncStorage.getItem(templatePrefillKey(userId, templateId));
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as TemplatePrefillPayload;
        if (parsed?.templateId !== templateId) return null;
        return parsed.items || [];
    } catch (error) {
        console.error('[workoutPrefillService] Failed to parse template prefill:', error);
        return null;
    }
}
