const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = (dir) => {
  return path.join(__dirname, '..', dir);
}

const config = {
  entry: {    //js的入口文件，支持多入口 注释①
    main: path.resolve(__dirname, '../src/index.js')
  },
  output: {   //js打包压缩后的出口文件，多入口时对应的配置应做相对变化 注释②
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    alias: {
      '@': resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_module/'),
      },
      {
        test: /\.tsx?$/,
        exclude: [
          /node_modules/
        ],
        use: {
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ]
        // use: [
        //   {
        //     loader: "vue-style-loader" // 将 JS 字符串生成为 style 节点
        //   },
        //   {
        //     loader: "style-loader" // 将 JS 字符串生成为 style 节点
        //   },
        //   {
        //     loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
        //   },
        //   {
        //     loader: "sass-loader" // 将 Sass 编译成 CSS
        //   }
        // ]
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: [
        //     MiniCssExtractPlugin.loader,
        //     'css-loader',
        //     'sass-loader',
        //   ],
        // })
      },
      {
        test: /\.css$/,
        // use: [
        //   'style-loader',
        //   { loader: 'css-loader', options: { importLoaders: 1 } },
        //   'postcss-loader'
        // ]
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
        // use: ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: [
        //     MiniCssExtractPlugin.loader,
        //     'css-loader',
        //     'postcss-loader',
        //   ],
        // })
      },
      {
        test: /\.vue$/,
        use: [
          { loader: 'vue-loader' },
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/public/index.html' }),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, '../src/public/static'),//"/src/public/static",
        to: path.resolve(__dirname, '../dist/static')
      }]
    }),
    new ExtractTextPlugin('css/index.css'),
    new MiniCssExtractPlugin(),
  ],

};
module.exports = config;