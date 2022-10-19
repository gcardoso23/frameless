const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
  },
  plugins: [new MiniCssExtractPlugin({ filename: '[name].css' })],
  devServer: {
    hot: true,
    // HTML templates can't be hot-swapped, so reload the page instead.
    watchFiles: ['app/views/**/*.html'],
  },
});
