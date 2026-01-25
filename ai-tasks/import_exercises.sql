-- Import exercises from CSV into public.exercises
-- Assumes ai-tasks/exercises.csv has header:
-- name,muscle_group,exercise_type,tracking_type,icon,color,instructions,is_custom

BEGIN;

CREATE TEMP TABLE exercise_import (
    name text,
    muscle_group text,
    exercise_type text,
    tracking_type exercise_tracking_type,
    icon text,
    color text,
    instructions text,
    is_custom boolean
);

-- Load CSV into the temp table.
-- Option A (psql):
-- \copy exercise_import(name,muscle_group,exercise_type,tracking_type,icon,color,instructions,is_custom)
--   FROM 'ai-tasks/exercises.csv' WITH (FORMAT csv, HEADER true);
--
-- Option B (Supabase SQL editor):
-- Upload the CSV into exercise_import using the UI import tool, then run the INSERT below.

INSERT INTO public.exercises (
    name,
    muscle_group_id,
    exercise_type,
    tracking_type,
    icon,
    color,
    instructions,
    is_custom
)
SELECT
    i.name,
    mg.id,
    i.exercise_type,
    i.tracking_type,
    i.icon,
    NULLIF(i.color, ''),
    NULLIF(i.instructions, ''),
    COALESCE(i.is_custom, false)
FROM exercise_import i
JOIN public.muscle_groups mg ON mg.name = i.muscle_group;

COMMIT;
