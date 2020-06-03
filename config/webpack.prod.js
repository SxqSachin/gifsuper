const baseWebpackConfig = require('./webpack.base.js');
const merge = require('webpack-merge');
const webpack = require('webpack');

const prodWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  plugins: [
  ]
})

module.exports = prodWebpackConfig;