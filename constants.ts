
import { Exercise, WorkoutLog } from './types';

export const EXERCISES: Exercise[] = [
  { id: '1', name: 'Incline Dumbbell Press', category: 'Chest', type: 'Compound', icon: 'fitness_center', color: 'primary' },
  { id: '2', name: 'Barbell Back Squat', category: 'Legs', type: 'Compound', icon: 'exercise', color: 'accent-purple' },
  { id: '3', name: 'Arnold Press', category: 'Shoulders', type: 'Compound', icon: 'directions_run', color: 'white/40' },
  { id: '4', name: 'Assisted Pull Up', category: 'Back', type: 'Compound', icon: 'sports_gymnastics', color: 'primary' },
  { id: '5', name: 'Barbell Row', category: 'Back', type: 'Isolation', icon: 'skateboarding', color: 'white/40' },
  { id: '6', name: 'Cable Crossover', category: 'Chest', type: 'Stretch', icon: 'self_improvement', color: 'white/40' },
];

export const RECENT_LOGS: WorkoutLog[] = [
  { id: '1', name: 'Push Day B', date: 'Oct 12', duration: '45m', volume: '12,400kg', icon: 'fitness_center' },
  { id: '2', name: 'Leg Day Alpha', date: 'Oct 10', duration: '1h 05m', volume: '18,200kg', icon: 'sprint' },
];
