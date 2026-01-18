/**
 * WorkoutScreen Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WorkoutScreen } from '@/screens/WorkoutScreen';

describe('WorkoutScreen', () => {
    describe('Rendering', () => {
        it('renders rest timer card', () => {
            const { getByTestId } = render(<WorkoutScreen />);
            expect(getByTestId('rest-timer')).toBeTruthy();
        });

        it('renders exercise info', () => {
            const { getByText } = render(<WorkoutScreen />);
            expect(getByText('Incline Dumbbell Press')).toBeTruthy();
        });

        it('renders set info', () => {
            const { getByText } = render(<WorkoutScreen />);
            expect(getByText('Set 3 of 4')).toBeTruthy();
        });

        it('renders log set button', () => {
            const { getByTestId } = render(<WorkoutScreen />);
            expect(getByTestId('log-set-button')).toBeTruthy();
        });

        it('renders add set button', () => {
            const { getByTestId } = render(<WorkoutScreen />);
            expect(getByTestId('add-set-button')).toBeTruthy();
        });
    });

    describe('Weight Input', () => {
        it('renders weight input with initial value', () => {
            const { getByText } = render(<WorkoutScreen />);
            expect(getByText('34.0')).toBeTruthy();
        });

        it('increments weight on + press', () => {
            const { getByTestId, getByText, queryByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('weight-input-increment'));

            // После нажатия значение должно увеличиться
            expect(getByText('35.0')).toBeTruthy();
        });

        it('decrements weight on - press', () => {
            const { getByTestId, getByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('weight-input-decrement'));

            expect(getByText('33.0')).toBeTruthy();
        });
    });

    describe('Reps Input', () => {
        it('renders reps input with initial value', () => {
            const { getByText } = render(<WorkoutScreen />);
            expect(getByText('12')).toBeTruthy();
        });

        it('increments reps on + press', () => {
            const { getByTestId, getByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('reps-input-increment'));

            expect(getByText('13')).toBeTruthy();
        });

        it('decrements reps on - press', () => {
            const { getByTestId, getByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('reps-input-decrement'));

            expect(getByText('11')).toBeTruthy();
        });
    });

    describe('Rest Timer', () => {
        it('displays formatted time', () => {
            const { getByText } = render(<WorkoutScreen />);
            expect(getByText('01')).toBeTruthy();
            expect(getByText('28')).toBeTruthy();
        });

        it('adds time on add button press', () => {
            const { getByTestId, getByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('rest-timer-add'));

            // 88 + 10 = 98 секунд = 01:38
            expect(getByText('38')).toBeTruthy();
        });

        it('subtracts time on subtract button press', () => {
            const { getByTestId, getByText } = render(<WorkoutScreen />);

            fireEvent.press(getByTestId('rest-timer-subtract'));

            // 88 - 5 = 83 секунды = 01:23
            expect(getByText('23')).toBeTruthy();
        });
    });
});
