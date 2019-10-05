const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  new webpack.DefinePlugin({
    'process.env.IS_PROD': true,
  })
];

module.exports = {
  output: {
    path: path.resolve(__dirname, './release/build'),
  },
  target: 'web',
  mode: 'production',
  plugins,
  // Prefer size and performance
  devtool: 'none',
};