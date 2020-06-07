const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const uglifyJS = require('uglify-js');

const resolve = (dir) => {
  return path.join(__dirname, '..', dir);
}

const config = {
  entry: {    //js的入口文件，支持多入口 注释①
    index: path.resolve(__dirname, '../src/pages/index/index.js'),
    about: path.resolve(__dirname, '../src/pages/about/index.js'),
  },
  output: {   //js打包压缩后的出口文件，多入口时对应的配置应做相对变化 注释②
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js'
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
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
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
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/pages/index/public/index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: './src/pages/about/public/index.html',
      chunks: ['about'],
    }),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/public/static'),//"/src/public/static",
          to: path.resolve(__dirname, '../dist/static')
        },
        {
          from: path.resolve(__dirname, '../src/pages/index/public/static'),//"/src/public/static",
          transform: (content) => {
            return uglifyJS.minify(content.toString()).code.toString();
          },
          to: path.resolve(__dirname, '../dist/static')
        },
        // {
        //   from: path.resolve(__dirname, '../src/pages/about/public/static'),//"/src/public/static",
        //   to: path.resolve(__dirname, '../dist/static')
        // },
      ]
    }),

    // new ExtractTextPlugin('css/index.css'),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],

};
module.exports = config;