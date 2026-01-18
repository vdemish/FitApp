/**
 * Button Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
    describe('Rendering', () => {
        it('renders children text correctly', () => {
            const { getByText } = render(<Button>Click Me</Button>);
            expect(getByText('Click Me')).toBeTruthy();
        });

        it('applies testID prop', () => {
            const { getByTestId } = render(
                <Button testID="test-button">Button</Button>
            );
            expect(getByTestId('test-button')).toBeTruthy();
        });
    });

    describe('Variants', () => {
        it('renders primary variant', () => {
            const { getByTestId } = render(
                <Button testID="btn" variant="primary">Primary</Button>
            );
            expect(getByTestId('btn')).toBeTruthy();
        });

        it('renders secondary variant', () => {
            const { getByTestId } = render(
                <Button testID="btn" variant="secondary">Secondary</Button>
            );
            expect(getByTestId('btn')).toBeTruthy();
        });

        it('renders ghost variant', () => {
            const { getByTestId } = render(
                <Button testID="btn" variant="ghost">Ghost</Button>
            );
            expect(getByTestId('btn')).toBeTruthy();
        });

        it('renders icon variant', () => {
            const { getByTestId } = render(
                <Button testID="btn" variant="icon">🔍</Button>
            );
            expect(getByTestId('btn')).toBeTruthy();
        });
    });

    describe('Sizes', () => {
        it('renders small size', () => {
            const { getByTestId } = render(
                <Button testID="btn" size="sm">Small</Button>
            );
            const button = getByTestId('btn');
            const styles = button.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ height: 40 })
                ])
            );
        });

        it('renders medium size', () => {
            const { getByTestId } = render(
                <Button testID="btn" size="md">Medium</Button>
            );
            const button = getByTestId('btn');
            const styles = button.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ height: 48 })
                ])
            );
        });

        it('renders large size', () => {
            const { getByTestId } = render(
                <Button testID="btn" size="lg">Large</Button>
            );
            const button = getByTestId('btn');
            const styles = button.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ height: 56 })
                ])
            );
        });
    });

    describe('States', () => {
        it('handles disabled state', () => {
            const onPress = jest.fn();
            const { getByTestId } = render(
                <Button testID="btn" disabled onPress={onPress}>
                    Disabled
                </Button>
            );

            fireEvent.press(getByTestId('btn'));
            expect(onPress).not.toHaveBeenCalled();
        });

        it('shows loading state', () => {
            const { getByTestId, queryByText } = render(
                <Button testID="btn" loading>
                    Loading
                </Button>
            );

            expect(getByTestId('btn')).toBeTruthy();
            // Текст не должен отображаться при loading
            expect(queryByText('Loading')).toBeNull();
        });

        it('applies fullWidth style', () => {
            const { getByTestId } = render(
                <Button testID="btn" fullWidth>
                    Full Width
                </Button>
            );

            const button = getByTestId('btn');
            const styles = button.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ width: '100%' })
                ])
            );
        });
    });

    describe('Interactions', () => {
        it('triggers onPress callback', () => {
            const onPress = jest.fn();
            const { getByTestId } = render(
                <Button testID="btn" onPress={onPress}>
                    Press
                </Button>
            );

            fireEvent.press(getByTestId('btn'));
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not trigger onPress when loading', () => {
            const onPress = jest.fn();
            const { getByTestId } = render(
                <Button testID="btn" loading onPress={onPress}>
                    Press
                </Button>
            );

            fireEvent.press(getByTestId('btn'));
            expect(onPress).not.toHaveBeenCalled();
        });
    });
});
