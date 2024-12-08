const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/react/index.js',
  output: {
    path: path.resolve(__dirname, 'src/ui'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};