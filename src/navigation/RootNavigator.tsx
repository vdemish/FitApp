/**
 * RootNavigator - Auth-aware root navigation
 * 
 * Shows LoginScreen when not authenticated, TabNavigator when authenticated
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '@/screens/LoginScreen';
import { ActiveWorkoutScreen } from '@/screens/ActiveWorkoutScreen';
import { useThemeColors } from '@/hooks';

import { SelectedExercise } from '@/types';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    ActiveWorkout: {
        workoutId?: string;
        templateId?: string;
        exercises?: SelectedExercise[];
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const { user, loading } = useAuth();
    const themeColors = useThemeColors();

    // Показать загрузку при проверке сессии
    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: themeColors.background
                }}
            >
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    <Stack.Screen
                        name="ActiveWorkout"
                        component={ActiveWorkoutScreen}
                        options={{
                            presentation: 'fullScreenModal',
                            animation: 'slide_from_bottom',
                            gestureEnabled: false, // Prevent accidental dismiss
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Main" component={TabNavigator} />
                </>
            )}
        </Stack.Navigator>
    );
}
