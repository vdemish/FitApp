// Мок для react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: ({ children }) => children,
        SafeAreaView: ({ children }) => children,
        useSafeAreaInsets: () => inset,
    };
});

// Мок для expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

// Мок для @react-navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
    useRoute: () => ({ params: {} }),
}));

// Мок для react-native Switch
jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return View;
});
