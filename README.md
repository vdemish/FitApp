<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/137dWPWHGdDZhxAn4nE4dQMRfMtpIAuxG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Timer Notifications Toggle (iOS device builds)

Notifications can be turned on/off at build time to avoid push entitlements on
physical devices before you join the Apple Developer Program.

- Enable notifications:
  `npm run ios:device:notifications`
- Disable notifications:
  `npm run ios:device:no-notifications` (also strips push entitlements after prebuild)

- Simulator with notifications:
  `npm run ios:sim:notifications`
