-- ============================================================================
-- Exercise Tracking Types Migration
-- Migration: 20260120120000_exercise_tracking_types.sql
-- ============================================================================
-- Creates ENUM for exercise tracking types and adds required columns
-- ============================================================================

-- 1. Create ENUM type for exercise tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_tracking_type') THEN
        CREATE TYPE exercise_tracking_type AS ENUM (
            'weight_reps',           -- Standard gym exercises (Bench Press)
            'weighted_bodyweight',   -- Bodyweight + optional weight (Dips, Pull-ups)
            'duration',              -- Time-based static exercises (Plank)
            'distance_duration'      -- Cardio (Running) - distance and time
        );
    END IF;
END $$;

-- 2. Add tracking_type column to exercises table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'tracking_type'
    ) THEN
        ALTER TABLE public.exercises 
        ADD COLUMN tracking_type exercise_tracking_type NOT NULL DEFAULT 'weight_reps';
    END IF;
END $$;

-- 3. Add distance and duration_seconds columns to sets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sets' AND column_name = 'distance'
    ) THEN
        ALTER TABLE public.sets ADD COLUMN distance numeric(10,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sets' AND column_name = 'duration_seconds'
    ) THEN
        ALTER TABLE public.sets ADD COLUMN duration_seconds integer;
    END IF;
END $$;

-- ============================================================================
-- DONE: ENUM and columns created
-- ============================================================================
