const appJson = require('./app.json');

module.exports = () => {
  const enableTimerNotifications =
    process.env.EXPO_PUBLIC_TIMER_NOTIFICATIONS === 'true';

  const baseConfig = appJson.expo ?? {};
  const existingPlugins = Array.isArray(baseConfig.plugins)
    ? baseConfig.plugins
    : [];

  const filteredPlugins = existingPlugins.filter((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] !== 'expo-notifications';
    }
    return plugin !== 'expo-notifications';
  });

  if (enableTimerNotifications) {
    filteredPlugins.push([
      'expo-notifications',
      { sounds: ['./assets/sounds/countdown.wav'] },
    ]);
  }

  return {
    ...baseConfig,
    plugins: filteredPlugins,
  };
};
