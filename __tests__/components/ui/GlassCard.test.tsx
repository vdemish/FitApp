/**
 * GlassCard Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';

describe('GlassCard', () => {
    describe('Rendering', () => {
        it('renders children correctly', () => {
            const { getByText } = render(
                <GlassCard>
                    <Text>Test Content</Text>
                </GlassCard>
            );

            expect(getByText('Test Content')).toBeTruthy();
        });

        it('applies testID prop', () => {
            const { getByTestId } = render(
                <GlassCard testID="test-card">
                    <Text>Content</Text>
                </GlassCard>
            );

            expect(getByTestId('test-card')).toBeTruthy();
        });
    });

    describe('Variants', () => {
        it('applies primary accent border', () => {
            const { getByTestId } = render(
                <GlassCard testID="card" accent="primary">
                    <Text>Content</Text>
                </GlassCard>
            );

            const card = getByTestId('card');
            const styles = card.props.style;
            // Проверяем что есть borderLeftWidth для accent
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ borderLeftWidth: 4 })
                ])
            );
        });

        it('applies success accent border', () => {
            const { getByTestId } = render(
                <GlassCard testID="card" accent="success">
                    <Text>Content</Text>
                </GlassCard>
            );

            const card = getByTestId('card');
            const styles = card.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ borderLeftWidth: 4 })
                ])
            );
        });

        it('applies purple accent border', () => {
            const { getByTestId } = render(
                <GlassCard testID="card" accent="purple">
                    <Text>Content</Text>
                </GlassCard>
            );

            const card = getByTestId('card');
            const styles = card.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ borderLeftWidth: 4 })
                ])
            );
        });

        it('applies no accent border when accent is none', () => {
            const { getByTestId } = render(
                <GlassCard testID="card" accent="none">
                    <Text>Content</Text>
                </GlassCard>
            );

            const card = getByTestId('card');
            const styles = card.props.style;
            // borderLeftWidth не должен быть в стилях для accent="none"
            const flatStyles = styles.flat ? styles.flat() : styles;
            const hasBorderLeft = flatStyles.some?.(
                (s: any) => s && s.borderLeftWidth === 4
            );
            expect(hasBorderLeft).toBeFalsy();
        });
    });

    describe('Interactions', () => {
        it('handles onPress callback', () => {
            const onPress = jest.fn();
            const { getByTestId } = render(
                <GlassCard testID="card" onPress={onPress}>
                    <Text>Content</Text>
                </GlassCard>
            );

            fireEvent.press(getByTestId('card'));
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not call onPress when not provided', () => {
            const { getByTestId } = render(
                <GlassCard testID="card">
                    <Text>Content</Text>
                </GlassCard>
            );

            // Должен рендериться как View, а не Pressable
            const card = getByTestId('card');
            expect(card).toBeTruthy();
        });
    });

    describe('Custom styles', () => {
        it('applies custom styles', () => {
            const { getByTestId } = render(
                <GlassCard testID="card" style={{ padding: 100 }}>
                    <Text>Content</Text>
                </GlassCard>
            );

            const card = getByTestId('card');
            const styles = card.props.style;
            expect(styles).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ padding: 100 })
                ])
            );
        });
    });
});
