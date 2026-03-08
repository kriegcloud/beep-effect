const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

module.exports = {
  entry: {
    "n3js"    : "./doc/n3-components.js",
    "n3js.min": "./doc/n3-components.js",
    // "n3js"    : "./node_modules/n3/lib/index.js",
    // "n3js.min": "./node_modules/n3/lib/index.js",
  },
  output: {
    filename: "[name].js",
    path: Path.resolve(__dirname, DocDir, WebPacksDir),
    publicPath: WebPacksDir,
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'N3js'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        "keep_classnames": false
      },
      include: /\.min\.js$/
    })]
  }
};
