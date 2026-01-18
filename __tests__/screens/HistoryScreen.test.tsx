/**
 * HistoryScreen Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { HistoryScreen } from '@/screens/HistoryScreen';

describe('HistoryScreen', () => {
    describe('Rendering', () => {
        it('renders header title', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('History')).toBeTruthy();
        });

        it('renders analytics subtitle', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('Analytics Dashboard')).toBeTruthy();
        });

        it('renders calendar button', () => {
            const { getByTestId } = render(<HistoryScreen />);
            expect(getByTestId('calendar-button')).toBeTruthy();
        });
    });

    describe('Volume Chart', () => {
        it('renders volume label', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('Total Volume (KG)')).toBeTruthy();
        });

        it('renders volume value', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('142,500')).toBeTruthy();
        });

        it('renders percentage change', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('+12%')).toBeTruthy();
        });

        it('renders date range labels', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('Oct 01')).toBeTruthy();
            expect(getByText('Oct 15')).toBeTruthy();
            expect(getByText('Oct 31')).toBeTruthy();
        });
    });

    describe('Calendar', () => {
        it('renders current month', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('October 2023')).toBeTruthy();
        });

        it('renders week day headers', () => {
            const { getAllByText } = render(<HistoryScreen />);
            // Проверяем что есть хотя бы один 'M' (понедельник)
            expect(getAllByText('M').length).toBeGreaterThan(0);
        });
    });

    describe('Recent Logs', () => {
        it('renders recent logs section', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('Recent Logs')).toBeTruthy();
        });

        it('renders workout log entries', () => {
            const { getByText } = render(<HistoryScreen />);
            expect(getByText('Push Day A')).toBeTruthy();
            expect(getByText('Pull Day B')).toBeTruthy();
            expect(getByText('Leg Day')).toBeTruthy();
        });

        it('displays workout metadata', () => {
            const { getByText } = render(<HistoryScreen />);
            // Проверяем что отображается дата и время
            expect(getByText(/Oct 03/)).toBeTruthy();
            expect(getByText(/58m/)).toBeTruthy();
        });
    });
});
