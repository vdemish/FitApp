// Мок для Expo winter runtime
module.exports = {
    structuredClone: (obj) => JSON.parse(JSON.stringify(obj)),
};
