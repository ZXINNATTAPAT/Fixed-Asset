// const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//   entry: './src/main.ts',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: '[name].bundle.js'
//   },
//   module: {
//     rules: [
//       {
//         test: /\.scss$/,
//         use: [
//           MiniCssExtractPlugin.loader,
//           'css-loader',
//           'sass-loader'
//         ],
//         include: path.resolve(__dirname, 'src/styles')
//       },
//       {
//         test: /\.ts$/,
//         use: 'ts-loader',
//         exclude: /node_modules/
//       },
//       {
//         test: /\.json$/,
//         type: 'json'
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.ts', '.js'],
//     alias: {
//       '@styles': path.resolve(__dirname, 'src/styles')
//     }
//   },
//   plugins: [
//     new MiniCssExtractPlugin({
//       filename: '[name].css',
//       chunkFilename: '[id].css',
//     }),
//     new HtmlWebpackPlugin({
//       template: 'src/index.html',
//       filename: 'index.html',
//       inject: 'body'
//     })
//   ]
// };
