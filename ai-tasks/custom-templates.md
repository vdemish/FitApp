We are implementing the "Create Template" flow on the `LibraryScreen`.

Task: Update the `LibraryScreen` to support multi-selection of exercises and saving them as a template.

Requirements:
1. Selection Mode:
   - Add a "+" button (or "Create") in the header.
   - When tapped, toggle the list of exercises into "Selection Mode".
   - In Selection Mode, tapping an exercise selects/deselects it (checkbox UI).
   - Show a floating bar or button at the bottom: "Save New Template ({count})".

2. Save Flow:
   - When "Save New Template" is clicked, open a small Modal (or Alert with input).
   - Ask the user for the "Template Name".
   - On confirm, call the `saveNewTemplate` service function (created previously).
   - On success: exit selection mode, clear selection, and show a success toast.

3. Display Updates:
   - Ensure the new template immediately appears in the `StartWorkoutModal` list.
   - Add a new section "My Templates" above the exercise list on the `LibraryScreen` to display these custom templates.

Output:
- Code snippets for the `LibraryScreen` state changes (isSelectionMode, selectedIds).
- The implementation of the "Name Input" modal.