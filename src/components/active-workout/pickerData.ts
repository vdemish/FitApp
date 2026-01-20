/**
 * pickerData.ts
 * Generates data arrays for the Wheel Picker
 */

export interface PickerItem {
    label: string;
    value: string;
}

/**
 * Generates weight values.
 * Default: 0 to 300, step 1.25
 */
export const getWeightItems = (): PickerItem[] => {
    const items: PickerItem[] = [];
    const maxWeight = 300;
    const step = 1.25;

    for (let w = 0; w <= maxWeight; w += step) {
        items.push({
            label: w.toFixed(2),
            value: w.toString(),
        });
    }
    return items;
};

/**
 * Generates reps values.
 * Default: 1 to 100, step 1
 */
export const getRepsItems = (): PickerItem[] => {
    const items: PickerItem[] = [];
    const maxReps = 100;

    for (let r = 0; r <= maxReps; r++) {
        items.push({
            label: r.toString(),
            value: r.toString(),
        });
    }
    return items;
};

/**
 * Generates distance values for cardio.
 * Default: 0 to 50 km, step 0.1
 */
export const getDistanceItems = (): PickerItem[] => {
    const items: PickerItem[] = [];
    const maxDistance = 50;
    const step = 0.1;

    for (let d = 0; d <= maxDistance; d += step) {
        items.push({
            label: d.toFixed(1),
            value: d.toFixed(1),
        });
    }
    return items;
};
