const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(vs|fs)$/,
        loader: 'ts-shader-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vs', '.fs'],
  },
};
