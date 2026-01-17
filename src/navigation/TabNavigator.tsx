/**
 * TabNavigator - Bottom tab navigation for authenticated users
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutScreen } from '@/screens/WorkoutScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { colors } from '@/theme';

export type TabParamList = {
    Workout: undefined;
    Library: undefined;
    History: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

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
                tabBarActiveTintColor: colors.primary.DEFAULT,
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
                tabBarStyle: {
                    backgroundColor: 'rgba(16, 20, 35, 0.95)',
                    borderTopColor: 'rgba(255, 255, 255, 0.05)',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 80,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
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
