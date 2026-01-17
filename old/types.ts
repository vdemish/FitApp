
export type Tab = 'workout' | 'library' | 'history' | 'profile';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  type: 'Compound' | 'Isolation' | 'Heavy' | 'Stretch';
  icon: string;
  color: string;
}

export interface WorkoutLog {
  id: string;
  name: string;
  date: string;
  duration: string;
  volume: string;
  icon: string;
}
