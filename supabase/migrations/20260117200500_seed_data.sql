-- ============================================================================
-- FitApp Demo Mode SEED DATA Migration
-- Migration: 20260117200500_seed_data.sql
-- ============================================================================
-- Populates the database with initial data for Demo Mode:
-- - Muscle groups (6 categories)
-- - System exercises (20+ exercises)
-- - Sample workout templates (3 templates)
-- ============================================================================

-- ============================================================================
-- MUSCLE GROUPS
-- ============================================================================

INSERT INTO public.muscle_groups (name, icon, color, sort_order) VALUES
    ('Chest', 'fitness_center', 'primary', 1),
    ('Back', 'sports_gymnastics', 'accent-purple', 2),
    ('Legs', 'sprint', 'accent-orange', 3),
    ('Shoulders', 'directions_run', 'accent-green', 4),
    ('Arms', 'front_hand', 'accent-blue', 5),
    ('Core', 'self_improvement', 'accent-pink', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- EXERCISES (System Library)
-- ============================================================================

-- Chest Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Bench Press', 'Chest', 'Compound', 'fitness_center'),
    ('Incline Dumbbell Press', 'Chest', 'Compound', 'fitness_center'),
    ('Decline Bench Press', 'Chest', 'Compound', 'fitness_center'),
    ('Cable Crossover', 'Chest', 'Isolation', 'self_improvement'),
    ('Dumbbell Flyes', 'Chest', 'Stretch', 'self_improvement'),
    ('Push-Ups', 'Chest', 'Compound', 'fitness_center')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- Back Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Deadlift', 'Back', 'Heavy', 'exercise'),
    ('Barbell Row', 'Back', 'Compound', 'exercise'),
    ('Lat Pulldown', 'Back', 'Compound', 'sports_gymnastics'),
    ('Assisted Pull Up', 'Back', 'Compound', 'sports_gymnastics'),
    ('Seated Cable Row', 'Back', 'Compound', 'sports_gymnastics'),
    ('Face Pulls', 'Back', 'Isolation', 'sports_martial_arts')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- Leg Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Barbell Back Squat', 'Legs', 'Compound', 'sprint'),
    ('Front Squat', 'Legs', 'Compound', 'sprint'),
    ('Leg Press', 'Legs', 'Compound', 'sprint'),
    ('Romanian Deadlift', 'Legs', 'Compound', 'exercise'),
    ('Leg Curl', 'Legs', 'Isolation', 'sprint'),
    ('Leg Extension', 'Legs', 'Isolation', 'sprint'),
    ('Calf Raises', 'Legs', 'Isolation', 'directions_walk')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- Shoulder Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Overhead Press', 'Shoulders', 'Compound', 'directions_run'),
    ('Arnold Press', 'Shoulders', 'Compound', 'directions_run'),
    ('Lateral Raises', 'Shoulders', 'Isolation', 'sports_martial_arts'),
    ('Front Raises', 'Shoulders', 'Isolation', 'sports_martial_arts'),
    ('Reverse Flyes', 'Shoulders', 'Isolation', 'sports_martial_arts')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- Arm Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Bicep Curl', 'Arms', 'Isolation', 'front_hand'),
    ('Hammer Curl', 'Arms', 'Isolation', 'front_hand'),
    ('Tricep Pushdown', 'Arms', 'Isolation', 'sports_gymnastics'),
    ('Skull Crushers', 'Arms', 'Isolation', 'sports_gymnastics'),
    ('Close-Grip Bench Press', 'Arms', 'Compound', 'fitness_center')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- Core Exercises
INSERT INTO public.exercises (name, muscle_group_id, exercise_type, icon, is_custom)
SELECT 
    e.name,
    mg.id,
    e.exercise_type::text,
    e.icon,
    false
FROM (VALUES
    ('Plank', 'Core', 'Isolation', 'self_improvement'),
    ('Hanging Leg Raises', 'Core', 'Compound', 'sports_gymnastics'),
    ('Cable Crunches', 'Core', 'Isolation', 'self_improvement'),
    ('Ab Wheel Rollout', 'Core', 'Compound', 'self_improvement')
) AS e(name, muscle_group, exercise_type, icon)
JOIN public.muscle_groups mg ON mg.name = e.muscle_group
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SYSTEM WORKOUT TEMPLATES
-- ============================================================================

-- Push Day Template
INSERT INTO public.workout_templates (name, icon, is_system)
VALUES ('Push Day A', 'fitness_center', true);

INSERT INTO public.template_exercises (template_id, exercise_id, sort_order, target_sets, rest_seconds)
SELECT 
    t.id,
    e.id,
    ord.sort_order,
    ord.target_sets,
    ord.rest_seconds
FROM public.workout_templates t
CROSS JOIN (VALUES
    ('Bench Press', 1, 4, 120),
    ('Incline Dumbbell Press', 2, 3, 90),
    ('Cable Crossover', 3, 3, 60),
    ('Overhead Press', 4, 3, 90),
    ('Lateral Raises', 5, 3, 60),
    ('Tricep Pushdown', 6, 3, 60)
) AS ord(exercise_name, sort_order, target_sets, rest_seconds)
JOIN public.exercises e ON e.name = ord.exercise_name
WHERE t.name = 'Push Day A' AND t.is_system = true;

-- Pull Day Template
INSERT INTO public.workout_templates (name, icon, is_system)
VALUES ('Pull Day A', 'sports_gymnastics', true);

INSERT INTO public.template_exercises (template_id, exercise_id, sort_order, target_sets, rest_seconds)
SELECT 
    t.id,
    e.id,
    ord.sort_order,
    ord.target_sets,
    ord.rest_seconds
FROM public.workout_templates t
CROSS JOIN (VALUES
    ('Deadlift', 1, 4, 180),
    ('Barbell Row', 2, 4, 120),
    ('Lat Pulldown', 3, 3, 90),
    ('Seated Cable Row', 4, 3, 90),
    ('Face Pulls', 5, 3, 60),
    ('Bicep Curl', 6, 3, 60)
) AS ord(exercise_name, sort_order, target_sets, rest_seconds)
JOIN public.exercises e ON e.name = ord.exercise_name
WHERE t.name = 'Pull Day A' AND t.is_system = true;

-- Leg Day Template
INSERT INTO public.workout_templates (name, icon, is_system)
VALUES ('Leg Day A', 'sprint', true);

INSERT INTO public.template_exercises (template_id, exercise_id, sort_order, target_sets, rest_seconds)
SELECT 
    t.id,
    e.id,
    ord.sort_order,
    ord.target_sets,
    ord.rest_seconds
FROM public.workout_templates t
CROSS JOIN (VALUES
    ('Barbell Back Squat', 1, 4, 180),
    ('Leg Press', 2, 3, 120),
    ('Romanian Deadlift', 3, 3, 120),
    ('Leg Curl', 4, 3, 60),
    ('Leg Extension', 5, 3, 60),
    ('Calf Raises', 6, 4, 45)
) AS ord(exercise_name, sort_order, target_sets, rest_seconds)
JOIN public.exercises e ON e.name = ord.exercise_name
WHERE t.name = 'Leg Day A' AND t.is_system = true;
