const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: {
      contentScript: './src/contentScript.tsx',
      background: './src/background.ts',
      options: './src/options.tsx'
    },
    output: {
      path: path.resolve(__dirname, isDev ? 'dev' : 'dist'),
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: '' },
          { from: 'icons', to: 'icons' },
          { from: 'src/contentStyle.css', to: '' },
          { from: 'src/options.html', to: '' }
        ],
      }),
    ],
    devtool: isDev ? 'source-map' : false,
  };
}
