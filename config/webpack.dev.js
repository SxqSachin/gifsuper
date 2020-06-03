const HtmlWebpackPlugin = require('html-webpack-plugin'); //通过 npm 安装
const path = require('path');        //node内置path模块，该模块主要集成文件系统路径操作API

const config = {
    mode: 'development',        //webpack打包的模式，上述命令里有介绍，也可以在本配置中配置
    entry: {    //js的入口文件，支持多入口 注释①
        main: path.resolve(__dirname,'../src/index.js')
    },
    output: {   //js打包压缩后的出口文件，多入口时对应的配置应做相对变化 注释②
        path: path.resolve(__dirname,'../dist'),
        filename:'bundle.js'
    },
    module: {
        rules: [] // 配置loder使用的规则、作用范围、控制输出的名称、位置等；主要作用是编译，解析文件； 暂时不使用loader
    },
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'})  //根据项目提供HTML模板，生成新页面，并将对应的输出打包压缩输出的js，链接到页面中；详细配置见注释④
    ]
};

module.exports = config;
