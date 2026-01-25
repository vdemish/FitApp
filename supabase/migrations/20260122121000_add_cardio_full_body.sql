-- ============================================================================
-- Add Cardio exercise type and Full Body muscle group
-- Migration: 20260122121000_add_cardio_full_body.sql
-- ============================================================================

-- Update exercise_type check constraint to allow Cardio
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.exercises'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%exercise_type%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.exercises DROP CONSTRAINT %I', constraint_name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.exercises'::regclass
          AND conname = 'exercises_exercise_type_check'
    ) THEN
        ALTER TABLE public.exercises
        ADD CONSTRAINT exercises_exercise_type_check
        CHECK (exercise_type IN ('Compound', 'Isolation', 'Heavy', 'Stretch', 'Cardio'));
    END IF;
END $$;

-- Add Full Body muscle group if missing
INSERT INTO public.muscle_groups (name, icon, color, sort_order)
VALUES ('Full Body', 'sports_gymnastics', 'accent-blue', 7)
ON CONFLICT (name) DO NOTHING;
