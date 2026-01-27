# Exercise Image Management Guide

This guide explains how to add exercise images for the `ExerciseDetailsCard` and where to store them.

## Where to store images

### Option A: Supabase Storage (recommended for remote updates)
- Use a bucket named `exercise-media` (public).
- Store files under: `exercise-media/exercises/<exercise_id>/`
- Example: `exercise-media/exercises/bench-press/bench-press.webp`
- Update the exercise row with the public URL.

### Option B: Local assets (best for bundled, offline-first builds)
- Place files in `assets/exercise-media/`.
- Use predictable filenames: `<exercise_id>.webp` or `<exercise_id>.gif`.
- Add mapping where you build `imageSource` for the component.

## File requirements
- **Format:** WebP for static images, GIF for short loops, PNG only when transparency is needed.
- **Resolution:** 1200 x 675 px (16:9) preferred; keep max dimension under 1600 px.
- **Aspect ratio:** 16:9 (matches the card image area).
- **File size:** Aim for < 600 KB for WebP and < 1.5 MB for GIF.

## Notes for speed and consistency
- Use a single hero image per exercise; avoid multiple variants.
- Keep backgrounds clean and high-contrast against dark/light UI.
- If using GIFs, 2-4 seconds loop, 15-24 fps.
