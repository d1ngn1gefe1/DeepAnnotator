
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
        test: /node_modules\/videojs-framebyframe\/.+\.js$/,
        loader: "imports?videojs=video.js"
      },
      {
        test: /node_modules\/bootstrap\/.+\.js$/,
        loader: "imports?jQuery=jquery,$=jquery"
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
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=100000@name=[name][ext]&name=./[hash].[ext]"
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  }
};

module.exports = config;
