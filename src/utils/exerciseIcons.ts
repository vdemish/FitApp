import type { ImageSourcePropType } from 'react-native';

export const exerciseIconMap: Record<string, ImageSourcePropType> = {
    ab_wheel: require('../../assets/exercise-icons/ab_wheel.png'),
    barbell: require('../../assets/exercise-icons/barbell.png'),
    bike: require('../../assets/exercise-icons/bike.png'),
    bodyweight: require('../../assets/exercise-icons/bodyweight.png'),
    cable: require('../../assets/exercise-icons/cable.png'),
    dip_bars: require('../../assets/exercise-icons/dip_bars.png'),
    dumbbell: require('../../assets/exercise-icons/dumbbell.png'),
    jump_rope: require('../../assets/exercise-icons/jump_rope.png'),
    kettlebell: require('../../assets/exercise-icons/kettlebell.png'),
    machine: require('../../assets/exercise-icons/machine.png'),
    medicine_ball: require('../../assets/exercise-icons/medicine_ball.png'),
    pullup_bar: require('../../assets/exercise-icons/pullup_bar.png'),
    resistance_band: require('../../assets/exercise-icons/resistance_band.png'),
    rower: require('../../assets/exercise-icons/rower.png'),
    treadmill: require('../../assets/exercise-icons/treadmill.png'),
    run: require('../../assets/exercise-icons/run.png'),
    default: require('../../assets/exercise-icons/default.png'),
    fitness_center: require('../../assets/exercise-icons/default.png'),
    sports_gymnastics: require('../../assets/exercise-icons/default.png'),
    accessibility_new: require('../../assets/exercise-icons/default.png'),
    directions_run: require('../../assets/exercise-icons/default.png'),
    sports_martial_arts: require('../../assets/exercise-icons/default.png'),
    self_improvement: require('../../assets/exercise-icons/default.png'),
};

export function getExerciseIconSource(icon?: string | null): ImageSourcePropType {
    if (!icon) return exerciseIconMap.default;
    return exerciseIconMap[icon] || exerciseIconMap.default;
}
