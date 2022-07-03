const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: { main: path.resolve(__dirname, "src/index.js") },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name][contenthash].js",
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
    new HtmlWebpackPlugin({
      title: "Webpack App Boilerplate",
      filename: "index.html",
      template: "src/template/template.html",
    }),
  ],
};
