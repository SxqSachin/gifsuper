const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const config = {
  entry: {    //js的入口文件，支持多入口 注释①
    main: path.resolve(__dirname, '../src/index.js')
  },
  output: {   //js打包压缩后的出口文件，多入口时对应的配置应做相对变化 注释②
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_module/'),
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // 将 JS 字符串生成为 style 节点
          },
          {
            loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
          },
          {
            loader: "sass-loader" // 将 Sass 编译成 CSS
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/public/index.html' }),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
  ],
  devServer: {        //webpack-dev-server配置（仅开发环境需要）
    contentBase: path.join(__dirname, './dist'), //编译打包文件的位置
    publicPath: '/',
    port: 8080,                 //服务器端口号
    host: '0.0.0.0',
    proxy: {},                  //代理列表
    compress: true,
    historyApiFallback: true,   //开启服务器history重定向模式
  }
};
module.exports = config;