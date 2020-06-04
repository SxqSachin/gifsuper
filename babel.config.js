module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/typescript",
  ],
  plugins: [
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",

    ["@babel/plugin-syntax-decorators", { decoratorsBeforeExport: true,}],
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true,}],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],
    // [
    //   "@babel/plugin-proposal-decorators", {
    //     decoratorsBeforeExport: true,
    //   }
    // ],
    // "@babel/plugin-proposal-class-properties",
  ]
}
