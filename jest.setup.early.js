// Expo SDK 54 - Early globals setup (runs BEFORE test environment)
// Необходимо для предотвращения ошибок winter runtime

// Мок structuredClone для Node.js < 18
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Мок для Expo import.meta registry
global.__ExpoImportMetaRegistry = new Map();

// Expo modules proxy
global.ExpoModules = {};
