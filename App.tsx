/**
 * ============================================================================
 * FitApp - React Native Entry Point
 * ============================================================================
 */

import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// KeyboardProvider temporarily disabled for Expo Go compatibility
// import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme';

/**
 * Custom navigation themes based on app colors
 */
const AppDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary.DEFAULT,
    background: colors.background.dark,
    card: colors.surface.dark,
    text: colors.text.primary.dark,
    border: colors.border.dark,
  },
};

const AppLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.light,
    background: colors.background.light,
    card: colors.surface.light,
    text: colors.text.primary.light,
    border: colors.border.light,
  },
};

/**
 * Inner component that has access to SettingsContext
 * This allows us to use the active theme for NavigationContainer and StatusBar
 */
function ThemedApp() {
  const { activeTheme } = useSettings();

  const navigationTheme = activeTheme === 'dark' ? AppDarkTheme : AppLightTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      </AuthProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemedApp />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
