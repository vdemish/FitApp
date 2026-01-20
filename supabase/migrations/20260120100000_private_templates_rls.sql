-- ============================================================================
-- Private Custom Templates RLS Migration
-- Migration: 20260120100000_private_templates_rls.sql
--Description: Updates RLS policies for workout_templates to support:
-- 1. Public Read: valid for system templates (user_id IS NULL).
-- 2. Private Custom Templates: User can CRUD entries where user_id = auth.uid().
-- ============================================================================

-- 1. Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Read system templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users manage own templates" ON public.workout_templates;
-- Just in case any other policies were created manually or in other branches
DROP POLICY IF EXISTS "Public Read" ON public.workout_templates;
DROP POLICY IF EXISTS "Private Read" ON public.workout_templates;
DROP POLICY IF EXISTS "Private Write" ON public.workout_templates;

-- 2. Enable RLS (idempotent)
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- 3. Create "Public Read" Policy
-- Everyone can read templates where user_id is NULL (System Default)
-- Note: usage typically checks "is_system" OR "user_id is null". 
-- The table has "is_system" boolean, but our new logic relies on user_id IS NULL for public.
-- To be safe and backward compatible with how system templates are defined (user_id=NULL, is_system=true),
-- we will allow reading if user_id IS NULL.
CREATE POLICY "Public Read System Templates"
    ON public.workout_templates FOR SELECT
    USING (user_id IS NULL);

-- 4. Create "Private Users manage own templates" Policy
-- Users can perform ALL operations (SELECT, INSERT, UPDATE, DELETE)
-- on rows where they are the owner (user_id = auth.uid())
CREATE POLICY "Users manage own templates"
    ON public.workout_templates FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. Update Template Exercises Policy (Cascade logic)
-- Ensure we can still access template_exercises if we have access to the template.
-- This policy usually relies on checking the template_id against workout_templates.
-- We verify the existing policy is sufficient, or update it.
-- Previous policy was:
-- CREATE POLICY "Access template exercises through template"
--    ON public.template_exercises FOR ALL
--    USING (
--        template_id IN (
--            SELECT id FROM public.workout_templates 
--            WHERE is_system = true OR user_id = auth.uid()
--        )
--    );

-- We should update this to align with "user_id is null OR user_id = auth.uid()" logic
-- to avoid relying solely on "is_system".
DROP POLICY IF EXISTS "Access template exercises through template" ON public.template_exercises;

CREATE POLICY "Access template exercises through template"
    ON public.template_exercises FOR ALL
    USING (
        template_id IN (
            SELECT id FROM public.workout_templates 
            WHERE user_id IS NULL OR user_id = auth.uid()
        )
    );
