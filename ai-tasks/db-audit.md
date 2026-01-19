**Context:**
The data is now loading in the correct order. We need to fix the visual layout issues on `ActiveWorkoutScreen`.

**Objective:**
Fix layout structure (Safe Area, Padding) and the Rest Timer visibility.

**Task 1: Layout Structure:**
* **Wrapper:** Wrap the entire screen content in `SafeAreaView` (edges: top/bottom).
* **Scroll Padding:** Add `contentContainerStyle={{ paddingBottom: 150 }}` to the main ScrollView/FlatList.
    * *Why:* To prevent the last exercise from being hidden behind the floating timer.
* **Spacing:** Add `marginBottom: 16` (or equivalent gap) between `ActiveExerciseCard` components.

**Task 2: Rest Timer Overlay:**
* **Position:** Move the `RestTimerCard` **outside** the ScrollView. It must be an absolute positioned sibling.
    ```tsx
    <View style={{ flex: 1 }}>
       <KeyboardAwareScrollView ...> ...content... </KeyboardAwareScrollView>
       
       {timerState.isActive && (
         <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 100 }}>
            <RestTimerCard ... />
         </View>
       )}
    </View>
    ```
* **Props:** Ensure `onClose` is connected to `actions.dismissTimer`.

**Constraint:**
Make sure the "Finish" button in the header is accessible.