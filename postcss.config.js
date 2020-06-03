const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const purgecss = require("@fullhuman/postcss-purgecss")({

  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    // './src/**/*.jsx',
    // './node_modules/prismjs/themes/*.css',
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

console.log(process.env.NODE_ENV);

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
    ...process.env.NODE_ENV === 'production'
      ? [purgecss]
      : []
  ]
}
