-- ============================================================================
-- Migration: Add Profile Fields (age, gender, training_goal)
-- ============================================================================
-- Adds new columns to the users table for extended profile editing

-- Добавляем новые колонки для расширенного профиля пользователя
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS age integer CHECK (age >= 1 AND age <= 150),
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS training_goal text CHECK (training_goal IN ('lose_weight', 'build_muscle', 'maintain', 'improve_endurance', 'general_fitness'));

-- Комментарии к новым колонкам
COMMENT ON COLUMN public.users.age IS 'Возраст пользователя';
COMMENT ON COLUMN public.users.gender IS 'Пол пользователя: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN public.users.training_goal IS 'Цель тренировок: lose_weight, build_muscle, maintain, improve_endurance, general_fitness';
