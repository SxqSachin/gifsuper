const baseWebpackConfig = require('./webpack.base.js');
const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

const resolve = (dir) => {
  return path.join(__dirname, '..', dir);
}

const prodWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial' // only package third parties that are initially dependent
        },
        vue: {
          name: 'chunk-vue', // split elementUI into a single package
          priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
          test: /[\\/]node_modules[\\/]_?vue(.*)/ // in order to adapt to cnpm
        },
        fabric: {
          name: 'chunk-fabric', // split elementUI into a single package
          priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
          test: /[\\/]node_modules[\\/]_?fabric(.*)/ // in order to adapt to cnpm
        },
        commons: {
          name: 'chunk-commons',
          test: resolve('src/components'), // can customize your rules
          minChunks: 3, //  minimum common number
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
  },
  plugins: [
    new SentryWebpackPlugin({
      // sentry-cli configuration
      authToken: '556a69005b074980af150dae5001f8f795181be12df145c69da6206870fab3c5',
      org: "sxqsachin",
      project: "gifsuper",

      // webpack specific configuration
      include: ".",
      ignore: ["node_modules", "webpack.config.js"],
    }),
  ]
})

module.exports = prodWebpackConfig;