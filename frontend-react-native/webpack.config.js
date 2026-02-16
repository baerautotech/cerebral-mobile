const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/',
  },

  mode: process.env.NODE_ENV || 'development',

  // Code splitting optimization
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@react-native/babel-preset'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
      // Fix for ESM modules in node_modules
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json'],
    // Fix for ESM module resolution issues
    fullySpecified: false,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
      inject: 'body',
    }),
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    compress: true,
    open: true,
  },
};
