const path = require("path");
//const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  target: "package",
  entry: { main: path.resolve(__dirname, "src/index.js") },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
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
    ],
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
    static: { directory: path.resolve(__dirname, "dist") },
    port: 3000,
    open: true,
    compress: true,
    historyApiFallback: true,
  },
  plugins: [
    /*
    new HtmlWebpackPlugin({
      title: "Webpack App Boilerplate",
      filename: "index.html",
      template: "src/template/template.html",
    }),
    */
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "./dist")],
    }),
  ],
};
