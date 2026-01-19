**Task:**
I need to refactor the UI and UX of the "Set Entry" component (where users log weight and reps for an exercise).
Currently, it uses standard `TextInput` and Plus/Minus buttons. I want to replace this with a "Wheel Picker" interface (similar to the iOS Clock/Alarm input) to reduce visual clutter and improve usability.

**Specific Requirements:**

1. **Remove Buttons:** Delete the existing "+" and "-" buttons. The interface should look clean.
2. **Interaction:**
* The Weight and Reps displays should look like text/values.
* When the user taps on the value, it should trigger a **Modal** (slide up from bottom) containing a Wheel Picker.
* The user scrolls to select the value and taps "Done" (or clicks outside) to confirm.


3. **Data Logic:**
* **Weight:** Generate values with a step of **1.25 kg** (e.g., 0, 1.25, 2.50 ... up to ~300).
* **Reps:** Generate integer values with a step of **1** (e.g., 1, 2, 3 ... up to 100).


4. **Tech Stack Implementation:**
* Use `@react-native-picker/picker` inside a React Native `Modal`.
* Use **NativeWind** for styling the Modal and the trigger button.
* Create a reusable `WheelInput` component that handles the modal visibility and the picker logic.
* Create a utility file `pickerData.ts` to generate the arrays for weight and reps efficiently.



**Output:**
Please provide:

1. The `pickerData.ts` utility code.
2. The reusable `WheelInput` component code.
3. An example of how to use this new component inside the main `SetRow` component.
