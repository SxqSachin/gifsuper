const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  mode: 'production',        //webpack打包的模式，上述命令里有介绍，也可以在本配置中配置
  entry: {    //js的入口文件，支持多入口 注释①
    main: path.resolve(__dirname, '../src/index.js')
  },
  output: {   //js打包压缩后的出口文件，多入口时对应的配置应做相对变化 注释②
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
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
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new CleanWebpackPlugin(),
  ],
};
module.exports = config;