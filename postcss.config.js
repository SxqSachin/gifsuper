const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const cssnano= require('cssnano');

const purgecss = require("@fullhuman/postcss-purgecss")({

  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    // './src/**/*.jsx',
    './node_modules/vue-slider-component/theme/*.css',
    './node_modules/vue-slider-component/src/*.css',
    './node_modules/vue-slider-component/dist-css/*.css',
    './node_modules/vue-select/src/*.css',
    './node_modules/vue-select/src/*.scss',
    './node_modules/vue-select/dist/*.css',
    // './node_modules/vue-ionicons/ionicons.css',
    // './src/assets/css/*.css',
    // './src/assets/css/*.scss',
    // etc.
  ],

  // Include any special characters you're using in this regular expression
  // defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []

  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
  // defaultExtractor: content => content.match(/[\w=*\-\"\[\]\:\,\)\>]+(?<!:)/g) || []
  // defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
    cssnano({ preset: 'default', }),
    ...process.env.NODE_ENV === 'production'
      ? []
      : []
  ]
}
