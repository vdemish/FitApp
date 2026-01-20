Task: Implement Drag-and-Drop reordering for exercises in the Active Workout.

Step 1: Audit
- Check the current implementation of the exercise list in `ActiveWorkoutScreen` (or the relevant component).
- Check if we already have `react-native-draggable-flatlist` or `react-native-reanimated` installed.
- Check if there is any commented-out code or unused "drag handles" related to reordering.

Step 2: Implementation
- If not installed, plan to use `react-native-draggable-flatlist` (standard for Expo).
- Replace the current list component with `DraggableFlatList`.
- Implementation details:
  - Trigger: The user should hold (long press) the exercise card to start dragging.
  - Visual Feedback: When dragging, the active card should slightly change opacity or scale (using `renderItem` props `drag` and `isActive`).
  - Data Update: On `onDragEnd`, update the local state with the new order of exercises.

Step 3: Output
- Provide the command to install necessary dependencies.
- Provide the updated code for the List Component wrapped in `GestureHandlerRootView`.
- Show the `renderItem` function handling the `drag` interaction.