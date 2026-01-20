Role: Senior React Native Developer
Context: We are working on a fitness app using React Native (Expo SDK 54), TypeScript, and NativeWind for styling.

Task: Implement the "Add Exercise" functionality on the Active Workout Screen.

Requirements:
1. UI Components:
   - Add a button labeled "Add exercise" fixed at the bottom of the Active Workout screen.
   - Create a Modal (or use a BottomSheet if available in the project) that opens when the button is clicked.
   - Inside the Modal, display a list of available exercises.

2. Functionality:
   - The list in the Modal must support multi-selection (checkbox or visual toggle).
   - Place an "Add" button at the bottom of the Modal.
   - Logic:
     - User clicks "Add exercise" -> Modal opens.
     - User selects one or multiple exercises.
     - User clicks "Add" -> Modal closes, and the selected exercises are appended to the current active workout list.

3. Tech Stack Constraints:
   - Use React Native functional components with Hooks.
   - Use NativeWind for all styling (Tailwind classes).
   - Ensure strict TypeScript typing for the Exercise interface and props.
   - Handle the state update immutably.