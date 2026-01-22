import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let initialized = false;
const NOTIFICATIONS_ENABLED =
    process.env.EXPO_PUBLIC_TIMER_NOTIFICATIONS === 'true';

export async function initTimerNotifications() {
    if (!NOTIFICATIONS_ENABLED) return;
    if (initialized) return;

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('timer', {
            name: 'Timers',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
    }

    initialized = true;
}

interface ScheduleTimerNotificationsOptions {
    startTimeMs: number;
    durationSeconds: number;
    label?: string;
}

interface PermissionResult {
    granted: boolean;
    canAskAgain: boolean;
}

export async function ensureTimerNotificationPermissions(): Promise<PermissionResult> {
    if (!NOTIFICATIONS_ENABLED) {
        return { granted: true, canAskAgain: true };
    }
    const settings = await Notifications.getPermissionsAsync();
    if (settings.status === 'granted') {
        return { granted: true, canAskAgain: settings.canAskAgain ?? true };
    }

    const request = await Notifications.requestPermissionsAsync();
    return { granted: request.status === 'granted', canAskAgain: request.canAskAgain ?? true };
}

interface ScheduleResult extends PermissionResult {
    ids: string[];
}

export async function scheduleTimerNotifications({
    startTimeMs,
    durationSeconds,
    label,
}: ScheduleTimerNotificationsOptions): Promise<ScheduleResult> {
    if (!NOTIFICATIONS_ENABLED) {
        return { ids: [], granted: true, canAskAgain: true };
    }
    await initTimerNotifications();
    const permission = await ensureTimerNotificationPermissions();
    if (!permission.granted) {
        return { ids: [], ...permission };
    }

    const ids: string[] = [];
    const now = Date.now();
    const endTimeMs = startTimeMs + durationSeconds * 1000;
    const titleBase = label ? `${label} Timer` : 'Timer';
    const soundName = Platform.OS === 'ios' ? 'countdown.wav' : 'default';

    if (endTimeMs > now) {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: titleBase,
                body: 'Timer finished',
                sound: soundName,
                interruptionLevel: 'timeSensitive',
                ...(Platform.OS === 'android' ? { channelId: 'timer' } : {}),
                data: { label: titleBase },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: endTimeMs,
            },
        });
        ids.push(id);
    }

    return { ids, ...permission };
}

export async function cancelTimerNotifications(ids: string[]) {
    if (!NOTIFICATIONS_ENABLED) return;
    await Promise.all(
        ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );
}
