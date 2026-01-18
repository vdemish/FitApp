/**
 * TabNavigator - Tab navigation with swipe support for authenticated users
 * Uses material-top-tabs positioned at bottom for swipe gestures
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WorkoutScreen } from '@/screens/WorkoutScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { colors } from '@/theme';
import { useThemeColors, useIsDarkTheme } from '@/hooks';

export type TabParamList = {
    Workout: undefined;
    Library: undefined;
    History: undefined;
    Profile: undefined;
};

const Tab = createMaterialTopTabNavigator<TabParamList>();

export function TabNavigator() {
    const themeColors = useThemeColors();
    const isDark = useIsDarkTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={({ route }) => ({
                swipeEnabled: true,
                lazy: true,
                animationEnabled: true,
                tabBarIcon: ({ focused, color }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;
                    const size = 24;

                    switch (route.name) {
                        case 'Workout':
                            iconName = focused ? 'barbell' : 'barbell-outline';
                            break;
                        case 'Library':
                            iconName = focused ? 'book' : 'book-outline';
                            break;
                        case 'History':
                            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarShowIcon: true,
                tabBarActiveTintColor: themeColors.primary,
                tabBarInactiveTintColor: isDark ? colors.tabBar.inactive.dark : colors.tabBar.inactive.light,
                tabBarStyle: {
                    backgroundColor: isDark ? colors.tabBar.background.dark : colors.tabBar.background.light,
                    borderTopColor: isDark ? colors.tabBar.border.dark : colors.tabBar.border.light,
                    borderTopWidth: 1,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                    height: 80 + (insets.bottom > 0 ? insets.bottom - 8 : 0),
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginTop: 4,
                },
                tabBarIndicatorStyle: {
                    backgroundColor: themeColors.primary,
                    height: 3,
                    borderRadius: 1.5,
                    position: 'absolute',
                    top: 0,
                },
                tabBarItemStyle: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 4,
                },
            })}
        >
            <Tab.Screen name="Workout" component={WorkoutScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

