import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { TIMER_SOUND_LEAD_SECONDS } from '@/constants/timer';

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
        await Notifications.setNotificationChannelAsync('timer-silent', {
            name: 'Timers (Silent)',
            importance: Notifications.AndroidImportance.MAX,
            sound: null,
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
    soundEnabled?: boolean;
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

function getNotificationContent(label?: string) {
    if (label === 'Rest') {
        return {
            title: 'Rest is finished',
            body: 'Go back to work!',
        };
    }

    if (label?.startsWith('Set ')) {
        return {
            title: "It's done!",
            body: 'Take a rest',
        };
    }

    const titleBase = label ? `${label} Timer` : 'Timer';
    return {
        title: titleBase,
        body: 'Timer ending',
    };
}

export async function scheduleTimerNotifications({
    startTimeMs,
    durationSeconds,
    label,
    soundEnabled = true,
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
    const soundName = Platform.OS === 'ios' ? 'countdown.wav' : 'default';
    const notificationSound = soundEnabled ? soundName : null;
    const notificationContent = getNotificationContent(label);

    if (endTimeMs > now) {
        const soundLeadMs = TIMER_SOUND_LEAD_SECONDS * 1000;
        const triggerTimeMs = Math.max(now + 100, endTimeMs - soundLeadMs);
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: notificationContent.title,
                body: notificationContent.body,
                sound: notificationSound,
                interruptionLevel: 'timeSensitive',
                ...(Platform.OS === 'android'
                    ? { channelId: soundEnabled ? 'timer' : 'timer-silent' }
                    : {}),
                data: { label: notificationContent.title },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerTimeMs,
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
