const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const SRC_DIR = path.resolve(__dirname, "./src");
const DIST_DIR = path.resolve(__dirname, "./dist");

module.exports = {
  mode: "production",
  target: "web",
  devtool: "inline-source-map",
  entry: { main: SRC_DIR + "/index.js" },
  output: {
    path: DIST_DIR,
    filename: "index.ts",
    library: "domElemJS",
    libraryTarget: "umd",
    globalObject: "this",
    umdNamedDefine: true,
    clean: true,
    assetModuleFilename: "[name][ext]",
  },
  module: {
    rules: [
      { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
      {
        test: /\.(jpg|jpeg|svg|gif|png|webp|bmp)$/i,
        type: "asset/resource",
      },
      {
        test: /\.ttf$/,
        use: ["url-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
  devServer: {
    static: { directory: DIST_DIR },
    port: 3000,
    open: true,
    compress: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Webpack App Boilerplate",
      filename: "index.html",
      template: "src/template/template.html",
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [DIST_DIR],
    }),
  ],
};
