const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Force zustand to resolve CJS files on web (ESM files use import.meta which Metro doesn't support)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.startsWith('zustand')) {
    const newContext = {
      ...context,
      unstable_conditionNames: ['react-native', 'default'],
    };
    return (originalResolveRequest || context.resolveRequest)(newContext, moduleName, platform);
  }
  return (originalResolveRequest || context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
