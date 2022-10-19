const fs = require('fs');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const dirApp = path.join(__dirname, 'app');
const dirViews = path.join(dirApp, 'views');
const dirDist = path.join(__dirname, 'dist');

// Every HTML file in app/views becomes a page with the same name in dist/.
const pages = fs
  .readdirSync(dirViews)
  .filter((file) => file.endsWith('.html'))
  .map(
    (file) =>
      new HtmlWebpackPlugin({
        template: path.join(dirViews, file),
        filename: file,
      })
  );

module.exports = {
  entry: path.join(dirApp, 'index.js'),
  output: {
    path: dirDist,
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.join(dirApp, 'static'), to: 'static' }],
    }),
    ...pages,
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            // Assets live in app/static and are referenced by their final
            // path (e.g. url('static/images/hero.jpg')), so leave url() alone.
            options: { url: false },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
};
