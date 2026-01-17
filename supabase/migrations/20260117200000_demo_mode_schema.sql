-- ============================================================================
-- FitApp Demo Mode Database Schema
-- Migration: 20260117200000_demo_mode_schema.sql
-- ============================================================================
-- This migration creates all tables required for Demo Mode:
-- Users preferences, Exercises, Workouts, Sets, Templates, and History view
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (create if not exists, then add new columns)
-- ============================================================================

-- Create users table if it doesn't exist (links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    current_weight_kg numeric(5,1),
    current_height_cm numeric(5,1),
    unit_preference text DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lbs')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_height_cm') THEN
        ALTER TABLE public.users ADD COLUMN current_height_cm numeric(5,1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'unit_preference') THEN
        ALTER TABLE public.users ADD COLUMN unit_preference text DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lbs'));
    END IF;
END $$;

-- ============================================================================
-- 2. MUSCLE GROUPS (Exercise Categories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.muscle_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    icon text NOT NULL,
    color text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read muscle groups"
    ON public.muscle_groups FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- 3. EXERCISES (Library)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    muscle_group_id uuid REFERENCES public.muscle_groups(id),
    exercise_type text NOT NULL CHECK (exercise_type IN ('Compound', 'Isolation', 'Heavy', 'Stretch')),
    icon text NOT NULL DEFAULT 'fitness_center',
    color text,
    instructions text,
    is_custom boolean NOT NULL DEFAULT false,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group_id);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by) WHERE is_custom = true;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Everyone can read system exercises
CREATE POLICY "Read system exercises"
    ON public.exercises FOR SELECT
    USING (is_custom = false);

-- Users can read their own custom exercises
CREATE POLICY "Read own custom exercises"
    ON public.exercises FOR SELECT
    USING (is_custom = true AND created_by = auth.uid());

-- Users can insert their own custom exercises
CREATE POLICY "Insert own custom exercises"
    ON public.exercises FOR INSERT
    WITH CHECK (is_custom = true AND created_by = auth.uid());

-- Users can update their own custom exercises
CREATE POLICY "Update own custom exercises"
    ON public.exercises FOR UPDATE
    USING (is_custom = true AND created_by = auth.uid());

-- Users can delete their own custom exercises
CREATE POLICY "Delete own custom exercises"
    ON public.exercises FOR DELETE
    USING (is_custom = true AND created_by = auth.uid());

-- ============================================================================
-- 4. WORKOUT TEMPLATES (Reusable Routines)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workout_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    icon text NOT NULL DEFAULT 'fitness_center',
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_templates_user ON public.workout_templates(user_id);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read system templates
CREATE POLICY "Read system templates"
    ON public.workout_templates FOR SELECT
    USING (is_system = true);

-- Users can CRUD their own templates
CREATE POLICY "Users manage own templates"
    ON public.workout_templates FOR ALL
    USING (is_system = false AND user_id = auth.uid());

-- ============================================================================
-- 5. TEMPLATE EXERCISES (Exercises in a Template)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.template_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES public.exercises(id),
    sort_order integer NOT NULL,
    target_sets integer NOT NULL DEFAULT 3,
    rest_seconds integer NOT NULL DEFAULT 90
);

CREATE INDEX idx_template_exercises_template ON public.template_exercises(template_id);

ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access template exercises through template"
    ON public.template_exercises FOR ALL
    USING (
        template_id IN (
            SELECT id FROM public.workout_templates 
            WHERE is_system = true OR user_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. WORKOUTS (Sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    template_id uuid REFERENCES public.workout_templates(id),
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    duration_seconds integer,
    total_volume numeric(12,2),
    icon text NOT NULL DEFAULT 'fitness_center',
    notes text
);

CREATE INDEX idx_workouts_user ON public.workouts(user_id);
CREATE INDEX idx_workouts_user_status ON public.workouts(user_id, status);
CREATE INDEX idx_workouts_started ON public.workouts(started_at DESC);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workouts"
    ON public.workouts FOR ALL
    USING (user_id = auth.uid());

-- ============================================================================
-- 7. WORKOUT EXERCISES (Exercises in a Session)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id uuid NOT NULL REFERENCES public.exercises(id),
    sort_order integer NOT NULL,
    rest_seconds integer NOT NULL DEFAULT 90
);

CREATE INDEX idx_workout_exercises_workout ON public.workout_exercises(workout_id);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access workout exercises through workout"
    ON public.workout_exercises FOR ALL
    USING (
        workout_id IN (SELECT id FROM public.workouts WHERE user_id = auth.uid())
    );

-- ============================================================================
-- 8. SETS (Individual Set Logs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id uuid NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_number integer NOT NULL,
    weight numeric(8,2) NOT NULL,
    reps integer NOT NULL,
    is_warmup boolean NOT NULL DEFAULT false,
    is_dropset boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    completed_at timestamptz,
    notes text
);

CREATE INDEX idx_sets_workout_exercise ON public.sets(workout_exercise_id);

ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access sets through workout chain"
    ON public.sets FOR ALL
    USING (
        workout_exercise_id IN (
            SELECT we.id FROM public.workout_exercises we
            JOIN public.workouts w ON we.workout_id = w.id
            WHERE w.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. EXERCISE HISTORY (Materialized View)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.exercise_history AS
SELECT DISTINCT ON (w.user_id, we.exercise_id)
    w.user_id,
    we.exercise_id,
    s.weight AS last_weight,
    s.reps AS last_reps,
    s.completed_at AS last_performed_at,
    (
        SELECT MAX(s2.weight)
        FROM public.sets s2
        JOIN public.workout_exercises we2 ON s2.workout_exercise_id = we2.id
        JOIN public.workouts w2 ON we2.workout_id = w2.id
        WHERE w2.user_id = w.user_id AND we2.exercise_id = we.exercise_id
    ) AS max_weight
FROM public.sets s
JOIN public.workout_exercises we ON s.workout_exercise_id = we.id
JOIN public.workouts w ON we.workout_id = w.id
WHERE s.status = 'completed'
ORDER BY w.user_id, we.exercise_id, s.completed_at DESC;

CREATE UNIQUE INDEX ON public.exercise_history (user_id, exercise_id);

-- ============================================================================
-- 10. USERS TABLE RLS (ensure policies exist)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile"
            ON public.users FOR SELECT
            USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON public.users FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- ============================================================================
-- DONE: All tables, indexes, and RLS policies created
-- ============================================================================
