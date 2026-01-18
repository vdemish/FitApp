/**
 * ProfileScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '@/screens/ProfileScreen';

// Мок AuthContext
const mockSignOut = jest.fn();

jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        user: { email: 'test@email.com' },
        profile: { full_name: 'John Doe' },
        signOut: mockSignOut,
    }),
}));

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders user avatar with initials', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('JD')).toBeTruthy();
        });

        it('renders user name', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('John Doe')).toBeTruthy();
        });

        it('renders member status', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Premium Member')).toBeTruthy();
        });
    });

    describe('Stats Row', () => {
        it('renders workouts count', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('142')).toBeTruthy();
            expect(getByText('Workouts')).toBeTruthy();
        });

        it('renders weight', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('84.5')).toBeTruthy();
            expect(getByText('Weight (kg)')).toBeTruthy();
        });

        it('renders streak', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('12')).toBeTruthy();
            expect(getByText('Week Streak')).toBeTruthy();
        });
    });

    describe('Settings Sections', () => {
        it('renders account settings section', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Account Settings')).toBeTruthy();
        });

        it('renders personal information row', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Personal Information')).toBeTruthy();
        });

        it('renders training metrics row', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Training Metrics')).toBeTruthy();
        });

        it('renders notifications row', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Reminders & Notifications')).toBeTruthy();
        });

        it('renders app preferences section', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('App Preferences')).toBeTruthy();
        });

        it('renders rest timer sounds toggle', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Rest Timer Sounds')).toBeTruthy();
        });

        it('renders units setting', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText('Units (kg, cm)')).toBeTruthy();
            expect(getByText('Metric')).toBeTruthy();
        });
    });

    describe('Sign Out', () => {
        it('renders sign out button', () => {
            const { getByTestId } = render(<ProfileScreen />);
            expect(getByTestId('sign-out-button')).toBeTruthy();
        });

        it('calls signOut on button press', async () => {
            const { getByTestId } = render(<ProfileScreen />);

            fireEvent.press(getByTestId('sign-out-button'));

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Version Info', () => {
        it('renders version info', () => {
            const { getByText } = render(<ProfileScreen />);
            expect(getByText(/Version 2.4.0/)).toBeTruthy();
        });
    });
});
