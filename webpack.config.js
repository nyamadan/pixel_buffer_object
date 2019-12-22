const HtmlWebpackPlugin = require("html-webpack-plugin");

const options = {
  mode: process.env["NODE_ENV"] || "development",
  devtool: false,
  entry: "./src/index.ts",
  target: "web",
  output: {
    filename: "index.js",
    path: __dirname + "/dist"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        use: [
          {
            loader: "eslint-loader",
            options: {
              /* Loader options go here */
            }
          }
        ]
      },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              sourceMap: process.env["NODE_ENV"] != "production",
              modules: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "Pixel Buffer Object Test"
    })
  ]
};

if (options.mode !== "production") {
  options.devtool = "source-map";
  options.module.rules.push({
    enforce: "pre",
    test: /\.js$/,
    loader: "source-map-loader"
  });
}

module.exports = options;
