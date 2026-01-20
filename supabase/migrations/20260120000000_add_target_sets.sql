-- Add target_sets column to template_exercises table
-- This allows specifying the default number of sets for each exercise in a template

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_exercises' AND column_name = 'target_sets') THEN
        ALTER TABLE public.template_exercises ADD COLUMN target_sets integer DEFAULT NULL;
    END IF;
END $$;
