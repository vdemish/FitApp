/**
 * RestTimerCard Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RestTimerCard } from '@/components/RestTimerCard';

describe('RestTimerCard', () => {
    const defaultProps = {
        seconds: 88, // 01:28
        onAdd: jest.fn(),
        onSubtract: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays time in MM:SS format', () => {
        const { getByText } = render(<RestTimerCard {...defaultProps} />);
        expect(getByText('01')).toBeTruthy();
        expect(getByText('28')).toBeTruthy();
    });

    it('displays single digit seconds with leading zero', () => {
        const { getByText } = render(<RestTimerCard seconds={65} />);
        expect(getByText('01')).toBeTruthy();
        expect(getByText('05')).toBeTruthy();
    });

    it('displays 00:00 for zero seconds', () => {
        const { getAllByText } = render(<RestTimerCard seconds={0} />);
        expect(getAllByText('00').length).toBe(2);
    });

    it('triggers onAdd callback', () => {
        const onAdd = jest.fn();
        const { getByTestId } = render(
            <RestTimerCard {...defaultProps} onAdd={onAdd} testID="timer" />
        );

        fireEvent.press(getByTestId('timer-add'));
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('triggers onSubtract callback', () => {
        const onSubtract = jest.fn();
        const { getByTestId } = render(
            <RestTimerCard {...defaultProps} onSubtract={onSubtract} testID="timer" />
        );

        fireEvent.press(getByTestId('timer-subtract'));
        expect(onSubtract).toHaveBeenCalledTimes(1);
    });

    it('applies testID prop', () => {
        const { getByTestId } = render(
            <RestTimerCard {...defaultProps} testID="rest-timer" />
        );
        expect(getByTestId('rest-timer')).toBeTruthy();
    });
});
