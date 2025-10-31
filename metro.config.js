const { getDefaultConfig } = require('expo/metro-config')

module.exports = (() => {
  const config = getDefaultConfig(__dirname)

  const { transformer, resolver } = config

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  }

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg', 'mjs'],
    resolveRequest: (context, moduleName, platform) => {
      // Redireciona react-dom para react-native no mobile
      if (moduleName === 'react-dom' && platform !== 'web') {
        return context.resolveRequest(context, 'react-native', platform)
      }
      return context.resolveRequest(context, moduleName, platform)
    },
  }

  return config
})()
