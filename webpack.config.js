var path = require("path");

var config = {
  entry: __dirname + "/app/components/Main.jsx",
  output: {
    path: __dirname + "/public/static/js",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          presets: ["react", "es2015"]
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      },
      {
        test: /\.png|\.jpe?g|\.gif|\.svg|\.woff|\.woff2|\.ttf|\.eot|\.ico|\.svg$/,
        loader: 'file?name=static/js/fonts/[name].[hash].[ext]?'
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  }
};

module.exports = config;
