const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const dirApp = path.join(__dirname, 'app');
const dirDist = path.join(__dirname, 'dist');

module.exports = {
  entry: [
    path.join(dirApp, 'index.js')
  ],
  output: {
    filename: 'bundle.[contenthash].js',
    path: dirDist,
    clean: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css'
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: path.join(dirApp, '/static'),
          to: path.join(dirDist, '/static')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.join(dirApp, '/views/index.html'),
      minify: false
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, {
            loader: 'css-loader',
            options: { url: false }
          },
          'postcss-loader',
          'sass-loader'
        ],
      },
    ]
  }
};