/**
 * Text Component Tests (Heading, Text, Label)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Heading, Text, Label } from '@/components/ui/Text';
import { colors, typography } from '@/theme';

describe('Heading', () => {
    describe('Levels', () => {
        it('renders level 1 heading', () => {
            const { getByText } = render(<Heading level={1}>H1 Title</Heading>);
            const heading = getByText('H1 Title');
            expect(heading).toBeTruthy();
            expect(heading.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.h1 })
                ])
            );
        });

        it('renders level 2 heading', () => {
            const { getByText } = render(<Heading level={2}>H2 Title</Heading>);
            const heading = getByText('H2 Title');
            expect(heading.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.h2 })
                ])
            );
        });

        it('renders level 3 heading', () => {
            const { getByText } = render(<Heading level={3}>H3 Title</Heading>);
            const heading = getByText('H3 Title');
            expect(heading.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.h3 })
                ])
            );
        });
    });

    describe('Accent', () => {
        it('applies accent color when accent is true', () => {
            const { getByText } = render(<Heading accent>Accent</Heading>);
            const heading = getByText('Accent');
            expect(heading.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: colors.primary.DEFAULT })
                ])
            );
        });
    });
});

describe('Text', () => {
    describe('Variants', () => {
        it('renders display variant', () => {
            const { getByText } = render(<Text variant="display">Display</Text>);
            const text = getByText('Display');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.display })
                ])
            );
        });

        it('renders body variant (default)', () => {
            const { getByText } = render(<Text>Body</Text>);
            const text = getByText('Body');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.body })
                ])
            );
        });

        it('renders body-sm variant', () => {
            const { getByText } = render(<Text variant="body-sm">Small</Text>);
            const text = getByText('Small');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.bodySm })
                ])
            );
        });

        it('renders caption variant', () => {
            const { getByText } = render(<Text variant="caption">Caption</Text>);
            const text = getByText('Caption');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ fontSize: typography.fontSize.caption })
                ])
            );
        });
    });

    describe('Modifiers', () => {
        it('applies muted style', () => {
            const { getByText } = render(<Text muted>Muted</Text>);
            const text = getByText('Muted');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: colors.text.muted.dark })
                ])
            );
        });

        it('applies accent color', () => {
            const { getByText } = render(<Text accent>Accent</Text>);
            const text = getByText('Accent');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ color: colors.primary.DEFAULT })
                ])
            );
        });

        it('applies uppercase transform', () => {
            const { getByText } = render(<Text uppercase>Upper</Text>);
            const text = getByText('Upper');
            expect(text.props.style).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ textTransform: 'uppercase' })
                ])
            );
        });
    });
});

describe('Label', () => {
    it('renders with correct styling', () => {
        const { getByText } = render(<Label>Label Text</Label>);
        const label = getByText('Label Text');
        expect(label).toBeTruthy();
        expect(label.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                })
            ])
        );
    });
});
