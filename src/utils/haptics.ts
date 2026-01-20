/**
 * Haptic Feedback Utility
 * Wraps expo-haptics to provide consistent feedback patterns throughout the app.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Triggers a light impact feedback.
 * Use for standard button presses and minor interactions.
 */
export const triggerLight = async () => {
    if (Platform.OS === 'web') return;
    try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
        // Ignore haptics errors (e.g. on unsupported devices)
        console.debug('Haptics error:', error);
    }
};

/**
 * Triggers a selection feedback.
 * Use for checkboxes, toggle switches, and list item selections.
 */
export const triggerSelection = async () => {
    if (Platform.OS === 'web') return;
    try {
        await Haptics.selectionAsync();
    } catch (error) {
        console.debug('Haptics error:', error);
    }
};

/**
 * Triggers a tick feedback for timer countdowns.
 * Uses selection feedback for a crisp, clock-like tick.
 */
export const triggerTimerTick = async () => {
    if (Platform.OS === 'web') return;
    try {
        await Haptics.selectionAsync();
    } catch (error) {
        console.debug('Haptics error:', error);
    }
};

/**
 * Triggers a success notification feedback.
 * Use for completing a workout, finishing a timer, or successful actions.
 */
export const triggerSuccess = async () => {
    if (Platform.OS === 'web') return;
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
        console.debug('Haptics error:', error);
    }
};
