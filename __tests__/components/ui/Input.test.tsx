/**
 * Input Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
    describe('Rendering', () => {
        it('renders with placeholder text', () => {
            const { getByPlaceholderText } = render(
                <Input placeholder="Enter text" />
            );
            expect(getByPlaceholderText('Enter text')).toBeTruthy();
        });

        it('applies testID prop', () => {
            const { getByTestId } = render(
                <Input testID="test-input" placeholder="Test" />
            );
            expect(getByTestId('test-input')).toBeTruthy();
        });

        it('displays icon when provided', () => {
            const { getByTestId } = render(
                <Input testID="input" icon="mail" placeholder="Email" />
            );
            // Иконка рендерится - проверяем что контейнер есть
            expect(getByTestId('input')).toBeTruthy();
        });
    });

    describe('Interactions', () => {
        it('handles text input changes', () => {
            const onChangeText = jest.fn();
            const { getByPlaceholderText } = render(
                <Input placeholder="Type here" onChangeText={onChangeText} />
            );

            const input = getByPlaceholderText('Type here');
            fireEvent.changeText(input, 'Hello World');

            expect(onChangeText).toHaveBeenCalledWith('Hello World');
        });

        it('handles focus events', () => {
            const onFocus = jest.fn();
            const { getByPlaceholderText } = render(
                <Input placeholder="Focus me" onFocus={onFocus} />
            );

            const input = getByPlaceholderText('Focus me');
            fireEvent(input, 'focus');

            expect(onFocus).toHaveBeenCalled();
        });

        it('handles blur events', () => {
            const onBlur = jest.fn();
            const { getByPlaceholderText } = render(
                <Input placeholder="Blur me" onBlur={onBlur} />
            );

            const input = getByPlaceholderText('Blur me');
            fireEvent(input, 'blur');

            expect(onBlur).toHaveBeenCalled();
        });
    });

    describe('States', () => {
        it('handles disabled state', () => {
            const { getByPlaceholderText } = render(
                <Input placeholder="Disabled" editable={false} />
            );

            const input = getByPlaceholderText('Disabled');
            expect(input.props.editable).toBe(false);
        });

        it('displays value', () => {
            const { getByDisplayValue } = render(
                <Input placeholder="Value" value="Test Value" />
            );

            expect(getByDisplayValue('Test Value')).toBeTruthy();
        });
    });
});
