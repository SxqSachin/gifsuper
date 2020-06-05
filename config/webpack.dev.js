const baseWebpackConfig = require('./webpack.base.js');
const merge = require('webpack-merge');
const path = require('path');

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  devServer: 
    {        //webpack-dev-server配置（仅开发环境需要）
      contentBase: path.join(__dirname, './dist'), //编译打包文件的位置
      publicPath: '/',
      port: 8082,                 //服务器端口号
      host: '0.0.0.0',
      proxy: {},                  //代理列表
      compress: true,
      historyApiFallback: true,   //开启服务器history重定向模式
      inline: true,
      // writeToDisk: true,
    },
})

module.exports = devWebpackConfig;