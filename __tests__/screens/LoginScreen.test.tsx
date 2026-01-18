/**
 * LoginScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/screens/LoginScreen';

// Мок AuthContext
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockClearError = jest.fn();

jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        signIn: mockSignIn,
        signUp: mockSignUp,
        loading: false,
        error: null,
        clearError: mockClearError,
    }),
}));

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders sign-in form by default', () => {
            const { getByText, getByPlaceholderText } = render(<LoginScreen />);

            expect(getByText('Войдите в свой аккаунт')).toBeTruthy();
            expect(getByPlaceholderText('your@email.com')).toBeTruthy();
            expect(getByPlaceholderText('Минимум 6 символов')).toBeTruthy();
        });

        it('shows name input only in sign-up mode', () => {
            const { getByText, queryByPlaceholderText, getByPlaceholderText } = render(
                <LoginScreen />
            );

            // В режиме входа нет поля имени
            expect(queryByPlaceholderText('Александр Иванов')).toBeNull();

            // Переключаемся на регистрацию
            fireEvent.press(getByText('Создать'));

            // Теперь поле имени должно появиться
            expect(getByPlaceholderText('Александр Иванов')).toBeTruthy();
        });
    });

    describe('Mode Toggle', () => {
        it('toggles to sign-up form', () => {
            const { getByText } = render(<LoginScreen />);

            fireEvent.press(getByText('Создать'));

            expect(getByText('Создайте аккаунт для начала')).toBeTruthy();
            expect(getByText('Войти')).toBeTruthy();
        });

        it('toggles back to sign-in form', () => {
            const { getByText } = render(<LoginScreen />);

            // Переключаемся на регистрацию
            fireEvent.press(getByText('Создать'));
            // Переключаемся обратно
            fireEvent.press(getByText('Войти'));

            expect(getByText('Войдите в свой аккаунт')).toBeTruthy();
        });

        it('clears error on mode toggle', () => {
            const { getByText } = render(<LoginScreen />);

            fireEvent.press(getByText('Создать'));

            expect(mockClearError).toHaveBeenCalled();
        });
    });

    describe('Form Validation', () => {
        it('submit button is disabled when form is invalid', () => {
            const { getByTestId } = render(<LoginScreen />);

            const button = getByTestId('submit-button');
            // Кнопка должна быть disabled (opacity 0.5)
            expect(button.props.accessibilityState?.disabled).toBe(true);
        });

        it('enables submit when form is valid', () => {
            const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);

            fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@email.com');
            fireEvent.changeText(getByPlaceholderText('Минимум 6 символов'), 'password123');

            const button = getByTestId('submit-button');
            expect(button.props.accessibilityState?.disabled).toBeFalsy();
        });
    });

    describe('Form Submission', () => {
        it('calls signIn on submit in sign-in mode', async () => {
            const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);

            fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@email.com');
            fireEvent.changeText(getByPlaceholderText('Минимум 6 символов'), 'password123');
            fireEvent.press(getByTestId('submit-button'));

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@email.com', 'password123');
            });
        });

        it('calls signUp on submit in sign-up mode', async () => {
            const { getByTestId, getByText, getByPlaceholderText } = render(<LoginScreen />);

            // Переключаемся на регистрацию
            fireEvent.press(getByText('Создать'));

            fireEvent.changeText(getByPlaceholderText('Александр Иванов'), 'Test User');
            fireEvent.changeText(getByPlaceholderText('your@email.com'), 'test@email.com');
            fireEvent.changeText(getByPlaceholderText('Минимум 6 символов'), 'password123');
            fireEvent.press(getByTestId('submit-button'));

            await waitFor(() => {
                expect(mockSignUp).toHaveBeenCalledWith('test@email.com', 'password123', 'Test User');
            });
        });
    });

    describe('OAuth Buttons', () => {
        it('renders Google button', () => {
            const { getByTestId } = render(<LoginScreen />);
            expect(getByTestId('google-button')).toBeTruthy();
        });

        it('renders Apple button', () => {
            const { getByTestId } = render(<LoginScreen />);
            expect(getByTestId('apple-button')).toBeTruthy();
        });
    });
});
