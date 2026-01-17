/**
 * ============================================================================
 * FitApp - React Native Entry Point
 * ============================================================================
 */

import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/context/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <NavigationContainer>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="light" />
          </AuthProvider>
        </NavigationContainer>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
