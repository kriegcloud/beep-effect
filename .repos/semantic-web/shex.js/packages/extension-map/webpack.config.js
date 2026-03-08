const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DocDir = "doc/"
const WebPacksDir = "webpacks/";

// webpack-bundle-analyzer can be run after compilation.
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// webpack-monitor is noisy so disabled by default (uses a deprecated API).
const WebpackMonitor = !!JSON.parse(process.env["WEBPACK_MONITOR"] || "false")
      ? new (require('webpack-monitor'))({
        capture: true,
        target: 'browser/webpack-monitor.json',
        launch: true
      })
      : []

module.exports = {
  entry: {
    "shexmap-webapp"    : "./shexmap-webapp.js",
    "shexmap-webapp.min": "./shexmap-webapp.js",
  },
  output: {
    filename: "[name].js",
    path: Path.resolve(__dirname, DocDir, WebPacksDir),
    publicPath: WebPacksDir,
    // libraryTarget: 'umd',
    // libraryExport: 'ShExWebApp',
    // umdNamedDefine: true,
    // // globalObject: 'this'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        "keep_classnames": false
      },
      include: /\.min\.js$/
    })]
  },
  resolve: {
    fallback: {
      // fs: false,
      // path: false,
      // net: 'empty',
      // tls: 'empty',
      // url: require.resolve("url/"),
    }
  },
  plugins: [
    // new BundleAnalyzerPlugin(/*{analyzerMode: 'json'}*/)
  ].concat(WebpackMonitor)
};
