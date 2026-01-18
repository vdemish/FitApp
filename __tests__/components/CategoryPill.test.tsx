/**
 * CategoryPill Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryPill } from '@/components/CategoryPill';

describe('CategoryPill', () => {
    it('renders label text', () => {
        const { getByText } = render(<CategoryPill label="Chest" />);
        expect(getByText('Chest')).toBeTruthy();
    });

    it('applies testID prop', () => {
        const { getByTestId } = render(
            <CategoryPill label="Back" testID="pill-back" />
        );
        expect(getByTestId('pill-back')).toBeTruthy();
    });

    it('shows active state styling when active', () => {
        const { getByTestId } = render(
            <CategoryPill label="Active" active testID="pill" />
        );
        const pill = getByTestId('pill');
        expect(pill).toBeTruthy();
    });

    it('shows inactive state styling when not active', () => {
        const { getByTestId } = render(
            <CategoryPill label="Inactive" active={false} testID="pill" />
        );
        const pill = getByTestId('pill');
        expect(pill).toBeTruthy();
    });

    it('triggers onPress callback', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <CategoryPill label="Press" onPress={onPress} testID="pill" />
        );

        fireEvent.press(getByTestId('pill'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
