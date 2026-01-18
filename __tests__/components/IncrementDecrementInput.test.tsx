/**
 * IncrementDecrementInput Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IncrementDecrementInput } from '@/components/IncrementDecrementInput';

describe('IncrementDecrementInput', () => {
    const defaultProps = {
        value: 10,
        onChange: jest.fn(),
        label: 'Weight (kg)',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays current value', () => {
        const { getByText } = render(<IncrementDecrementInput {...defaultProps} />);
        expect(getByText('10')).toBeTruthy();
    });

    it('displays label', () => {
        const { getByText } = render(<IncrementDecrementInput {...defaultProps} />);
        expect(getByText('Weight (kg)')).toBeTruthy();
    });

    it('displays value with decimals when specified', () => {
        const { getByText } = render(
            <IncrementDecrementInput {...defaultProps} value={10.5} decimals={1} />
        );
        expect(getByText('10.5')).toBeTruthy();
    });

    it('increments value on + press', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <IncrementDecrementInput
                {...defaultProps}
                onChange={onChange}
                testID="input"
            />
        );

        fireEvent.press(getByTestId('input-increment'));
        expect(onChange).toHaveBeenCalledWith(11);
    });

    it('decrements value on - press', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <IncrementDecrementInput
                {...defaultProps}
                onChange={onChange}
                testID="input"
            />
        );

        fireEvent.press(getByTestId('input-decrement'));
        expect(onChange).toHaveBeenCalledWith(9);
    });

    it('respects min value', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <IncrementDecrementInput
                {...defaultProps}
                value={0}
                min={0}
                onChange={onChange}
                testID="input"
            />
        );

        fireEvent.press(getByTestId('input-decrement'));
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it('respects max value', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <IncrementDecrementInput
                {...defaultProps}
                value={100}
                max={100}
                onChange={onChange}
                testID="input"
            />
        );

        fireEvent.press(getByTestId('input-increment'));
        expect(onChange).toHaveBeenCalledWith(100);
    });

    it('applies custom step value', () => {
        const onChange = jest.fn();
        const { getByTestId } = render(
            <IncrementDecrementInput
                {...defaultProps}
                step={2.5}
                onChange={onChange}
                testID="input"
            />
        );

        fireEvent.press(getByTestId('input-increment'));
        expect(onChange).toHaveBeenCalledWith(12.5);
    });
});
