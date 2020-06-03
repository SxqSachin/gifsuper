const baseWebpackConfig = require('./webpack.base.js');
const merge = require('webpack-merge');

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
})

module.exports = devWebpackConfig;