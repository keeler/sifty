const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const devConfig = require('./webpack.dev.config');
const prodConfig = require('./webpack.prod.config');


const config = {
  context: path.resolve(__dirname, './extension'),
  entry: {
    'background': './background.js',
    'content_scripts/getItem': './content_scripts/getItem.js'
  },
  output: {
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  },
  resolve: {
    extensions: ['.js'],
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  optimization: {},
  module: {
    rules: [],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'icons/*' }
      ]
    }),
  ],
};

module.exports = (env, argv) => {
  let envConfig;

  if (argv.mode === 'development') {
    envConfig = devConfig;
  }

  if (argv.mode === 'production') {
    envConfig = prodConfig;
  }

  return merge(config, envConfig);
};