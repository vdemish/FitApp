/**
 * LibraryScreen Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LibraryScreen } from '@/screens/LibraryScreen';

describe('LibraryScreen', () => {
    describe('Rendering', () => {
        it('renders header title', () => {
            const { getByText } = render(<LibraryScreen />);
            expect(getByText(/Exercise/)).toBeTruthy();
            expect(getByText(/Library/)).toBeTruthy();
        });

        it('renders search input', () => {
            const { getByTestId } = render(<LibraryScreen />);
            expect(getByTestId('search-input')).toBeTruthy();
        });

        it('renders category pills', () => {
            const { getByTestId } = render(<LibraryScreen />);
            expect(getByTestId('category-all')).toBeTruthy();
            expect(getByTestId('category-chest')).toBeTruthy();
            expect(getByTestId('category-back')).toBeTruthy();
        });

        it('renders add exercise button', () => {
            const { getByTestId } = render(<LibraryScreen />);
            expect(getByTestId('add-exercise-button')).toBeTruthy();
        });

        it('renders commonly used section', () => {
            const { getByText } = render(<LibraryScreen />);
            expect(getByText('Commonly Used')).toBeTruthy();
        });

        it('renders A-Z section', () => {
            const { getByText } = render(<LibraryScreen />);
            expect(getByText('A-Z')).toBeTruthy();
        });
    });

    describe('Category Filtering', () => {
        it('shows all exercises by default', () => {
            const { getByText } = render(<LibraryScreen />);
            expect(getByText('Bench Press')).toBeTruthy();
            expect(getByText('Pull-ups')).toBeTruthy();
            expect(getByText('Squats')).toBeTruthy();
        });

        it('filters exercises by Chest category', () => {
            const { getByTestId, getByText, queryByText } = render(<LibraryScreen />);

            fireEvent.press(getByTestId('category-chest'));

            expect(getByText('Bench Press')).toBeTruthy();
            expect(getByText('Incline Dumbbell Press')).toBeTruthy();
            expect(queryByText('Pull-ups')).toBeNull();
            expect(queryByText('Squats')).toBeNull();
        });

        it('filters exercises by Back category', () => {
            const { getByTestId, getByText, queryByText } = render(<LibraryScreen />);

            fireEvent.press(getByTestId('category-back'));

            expect(getByText('Pull-ups')).toBeTruthy();
            expect(getByText('Deadlift')).toBeTruthy();
            expect(queryByText('Bench Press')).toBeNull();
        });

        it('restores all exercises when All is selected', () => {
            const { getByTestId, getByText } = render(<LibraryScreen />);

            // Сначала фильтруем
            fireEvent.press(getByTestId('category-chest'));
            // Потом возвращаем All
            fireEvent.press(getByTestId('category-all'));

            expect(getByText('Bench Press')).toBeTruthy();
            expect(getByText('Pull-ups')).toBeTruthy();
            expect(getByText('Squats')).toBeTruthy();
        });
    });

    describe('Search', () => {
        it('filters exercises by search query', () => {
            const { getByTestId, getByText, queryByText, getByPlaceholderText } = render(
                <LibraryScreen />
            );

            fireEvent.changeText(getByPlaceholderText('Search exercises...'), 'bench');

            expect(getByText('Bench Press')).toBeTruthy();
            expect(queryByText('Pull-ups')).toBeNull();
        });

        it('shows empty state when no matches', () => {
            const { getByPlaceholderText, getByText } = render(<LibraryScreen />);

            fireEvent.changeText(getByPlaceholderText('Search exercises...'), 'xyznonexistent');

            expect(getByText('No exercises found')).toBeTruthy();
        });
    });
});
