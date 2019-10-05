const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  new webpack.DefinePlugin({
    'process.env.IS_PROD': false,
  }),
  new CopyWebpackPlugin([
    {
      from: 'node_modules/jasmine-core/lib/jasmine-core/*.*',
      to: 'test/utils/jasmine-core/',
      context: '../',
      flatten: true,
    },
    {from: 'test/resources/**'},
    {from: 'test/utils/**'},
    {from: 'test/*'}
  ]),
];

module.exports = {
  entry: {
    'test/integration/all.spec': './test/integration/all.spec.js'
  },
  output: {
    path: path.resolve(__dirname, './build'),
  },
  // FIX: Module not found: Error: Can't resolve 'fs'
  node: { fs: 'empty' },
  target: 'web',
  mode: 'development',
  plugins,
  /**
   * Only one that works on FF
   * Issue on webpack: https://github.com/webpack/webpack/issues/1194
   * Issue on web-ext toolbox: https://github.com/webextension-toolbox/webextension-toolbox/issues/58
   */
  devtool: 'inline-source-map',
};