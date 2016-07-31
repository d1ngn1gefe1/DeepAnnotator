
var config = {
  entry: [
    "bootstrap-loader",
    __dirname + "/app/components/Main.jsx"
  ],
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
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader"
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        // Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
        // loader: "url?limit=10000"
        loader: "url"
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        loader: 'file'
      },
      {
        test: /\.json$/,
        loader: "json"
      },
      {
        test: /bootstrap-sass\/assets\/javascripts\//,
        loader: "imports?jQuery=jquery,$=jquery"
      }
    ]
  }
};

module.exports = config;
