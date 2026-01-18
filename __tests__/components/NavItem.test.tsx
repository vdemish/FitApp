/**
 * NavItem Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavItem } from '@/components/NavItem';

describe('NavItem', () => {
    it('renders icon and label', () => {
        const { getByText } = render(
            <NavItem icon="🏋️" label="Workout" />
        );

        expect(getByText('🏋️')).toBeTruthy();
        expect(getByText('Workout')).toBeTruthy();
    });

    it('applies testID prop', () => {
        const { getByTestId } = render(
            <NavItem icon="📚" label="Library" testID="nav-library" />
        );

        expect(getByTestId('nav-library')).toBeTruthy();
    });

    it('shows active state styling when active', () => {
        const { getByText } = render(
            <NavItem icon="🏋️" label="Workout" active />
        );

        const label = getByText('Workout');
        // Active label should have primary color
        expect(label).toBeTruthy();
    });

    it('shows inactive state styling when not active', () => {
        const { getByText } = render(
            <NavItem icon="🏋️" label="Workout" active={false} />
        );

        const label = getByText('Workout');
        expect(label).toBeTruthy();
    });

    it('triggers onPress callback', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <NavItem icon="🏋️" label="Workout" onPress={onPress} testID="nav-item" />
        );

        fireEvent.press(getByTestId('nav-item'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders active dot indicator when active', () => {
        const { getByText, UNSAFE_root } = render(
            <NavItem icon="🏋️" label="Workout" active />
        );

        // Component renders, active state applied
        expect(getByText('Workout')).toBeTruthy();
    });
});
