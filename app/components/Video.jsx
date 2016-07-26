var React = require("react");
var ReactDOM = require("react-dom");
var cx = require("classnames");
var vjs = require("video.js");
var vjsPlaylist = require("videojs-playlist");
var vjsPlaylistUI = require("videojs-playlist-ui");
var _forEach = require("lodash/forEach");
var _debounce = require("lodash/debounce");
var _defaults = require("lodash/defaults");

var DEFAULT_HEIGHT = 240;
var DEFAULT_WIDTH = 320;
var DEFAULT_SCALING = 2;
var DEFAULT_ASPECT_RATIO = (4 / 3);
var DEFAULT_ADJUSTED_SIZE = 0;
var DEFAULT_RESIZE_DEBOUNCE_TIME = 500;
var DEFAULT_VIDEO_OPTIONS = {
  preload: "auto",
  autoplay: false,
  controls: true
};

function noop() {}

var Video = React.createClass({
  propTypes: {
    playlistName: React.PropTypes.string.isRequired,
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number.isRequired,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    endlessMode: React.PropTypes.bool,
    options: React.PropTypes.object,
    onReady: React.PropTypes.func,
    eventListeners: React.PropTypes.object,
    resize: React.PropTypes.bool,
    resizeOptions: React.PropTypes.shape({
      aspectRatio: React.PropTypes.number,
      shortWindowVideoHeightAdjustment: React.PropTypes.number,
      defaultVideoWidthAdjustment: React.PropTypes.number,
      debounceTime: React.PropTypes.number
    }),
    vjsDefaultSkin: React.PropTypes.bool,
    vjsBigPlayCentered: React.PropTypes.bool,
    children: React.PropTypes.element,
    dispose: React.PropTypes.bool,
    onNextVideo: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      endlessMode: false,
      options: DEFAULT_VIDEO_OPTIONS,
      onReady: noop,
      eventListeners: {},
      resize: false,
      resizeOptions: {},
      vjsDefaultSkin: true,
      vjsBigPlayCentered: true,
      onNextVideo: noop
    };
  },

  componentDidMount: function() {
    console.log("componentDidMount");

    var self = this;
    var playlist = [];

    for (var i = self.props.start; i < self.props.end; i++) {
      playlist.push({
        "sources": [{
          "src": "/static/video/"+self.props.playlistName+"/"+i+"/depth.mp4", "type": "video/mp4"
        }],
        "name": "Video "+i,
        "thumbnail": "/static/video/"+self.props.playlistName+"/"+i+"/thumbnail.jpg"
      });
    }

    self.mountVideoPlayer(playlist);

    // wait 3 seconds at the end of a video before proceeding automatically to the next video
    // self._player.playlist.autoadvance(3);

    // user chooses a different video
    self._player.on("suspend", function() {
      console.log("suspend");
      console.log(self._player.playlist());
      console.log(self._player.playlist.currentItem());
    });
  },
getVideoPlayerOptions
  handleClick: function() {
     console.log("handleClick");
     this._player.playlist.next();
     console.log(this._player.playlist.currentItem());
  },

  componentWillReceiveProps: function(nextProps) {
    console.log("componentWillReceiveProps");
    var isEndless = this.props.endlessMode;
    var willBeEndless = nextProps.endlessMode;

    if (isEndless !== willBeEndless) {
      if (willBeEndless) {
        this.addEndlessMode();
      } else {
        this.removeEndlessMode();
      }
    }

    var isResizable = this.props.resize;
    var willBeResizeable = nextProps.resize;

    if (isResizable !== willBeResizeable) {
      if (willBeResizeable) {
        this.addResizeEventListener();
      } else {
        this.removeResizeEventListener();
      }
    }
  },

  shouldComponentUpdate: function() {
    return false;
  },

  componentWillUnmount: function() {
    console.log("componentWillUnmount");
    this.unmountVideoPlayer();
  },

  getVideoPlayer: function() {
    return this._player;
  },

  getVideoPlayerEl: function() {
    return ReactDOM.findDOMNode(this.refs["player"]);
  },

  getVideoPlayerOptions: function() {
    return _defaults(
      {}, this.props.options, {
      height: this.props.resize ? "auto" : (this.props.height || DEFAULT_HEIGHT*DEFAULT_SCALING),
      width: this.props.resize ? "auto" : (this.props.width || DEFAULT_WIDTH*DEFAULT_SCALING)
    }, DEFAULT_VIDEO_OPTIONS);
  },

  getVideoResizeOptions: function() {
    return _defaults({}, this.props.resizeOptions, {
      aspectRatio: DEFAULT_ASPECT_RATIO,
      shortWindowVideoHeightAdjustment: DEFAULT_ADJUSTED_SIZE,
      defaultVideoWidthAdjustment: DEFAULT_ADJUSTED_SIZE,
      debounceTime: DEFAULT_RESIZE_DEBOUNCE_TIME
    });
  },

  getResizedVideoPlayerMeasurements: function() {
    var resizeOptions = this.getVideoResizeOptions();
    var aspectRatio = resizeOptions.aspectRatio;
    var defaultVideoWidthAdjustment = resizeOptions.defaultVideoWidthAdjustment;

    var winHeight = this._windowHeight();

    var baseWidth = this._videoElementWidth();

    var vidWidth = baseWidth - defaultVideoWidthAdjustment;
    var vidHeight = vidWidth * aspectRatio;

    if (winHeight < vidHeight) {
      var shortWindowVideoHeightAdjustment = resizeOptions.shortWindowVideoHeightAdjustment;
      vidHeight = winHeight - shortWindowVideoHeightAdjustment;
    }

    return {
      width: vidWidth,
      height: vidHeight
    };
  },

  mountVideoPlayer: function(playlist) {
    var self = this;
    var options = this.getVideoPlayerOptions();

    this._player = vjs("player", options);
    this._player.playlist(playlist);
    this._player.playlistUi();

    this._player.ready(function() {
      self.handleVideoPlayerReady()
    });

    _forEach(this.props.eventListeners, function(val, key) {
      this._player.on(key, val);
    });

    if (this.props.endlessMode) {
      this.addEndlessMode();
    }
  },

  unmountVideoPlayer: function() {
    this.removeResizeEventListener();
    this._player.dispose();
  },

  addEndlessMode: function() {
    var player = this._player;

    player.on("ended", this.handleNextVideo);

    if (player.ended()) {
      this.handleNextVideo();
    }
  },

  addResizeEventListener: function() {
    var debounceTime = this.getVideoResizeOptions().debounceTime;

    this._handleVideoPlayerResize = _debounce(this.handleVideoPlayerResize, debounceTime);
    window.addEventListener("resize", this._handleVideoPlayerResize);
  },

  removeEndlessMode: function() {
    var player = this._player;

    player.off("ended", this.handleNextVideo);
  },

  removeResizeEventListener: function() {
    window.removeEventListener("resize", this._handleVideoPlayerResize);
  },

  pauseVideo: function() {
    this._player.pause();
  },

  playVideo: function() {
    this._player.play();
  },

  restartVideo: function() {
    this._player.currentTime(0).play();
  },

  togglePauseVideo: function() {
    if (this._player.paused()) {
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  },

  handleVideoPlayerReady: function() {
    this
      .getVideoPlayerEl()
      .parentElement
      .removeAttribute("data-reactid");

    if (this.props.resize) {
      this.handleVideoPlayerResize();
      this.addResizeEventListener();
    }

    this.props.onReady();
  },

  handleVideoPlayerResize: function() {
    var player = this._player;
    var videoMeasurements = this.getResizedVideoPlayerMeasurements();

    player.dimensions(videoMeasurements.width, videoMeasurements.height);
  },

  handleNextVideo: function() {
    this.props.onNextVideo();
  },

  renderDefaultWarning: function() {
    return (
      <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>.
      </p>
    );
  },

  _windowHeight: function() {
    return window.innerHeight;
  },

  _videoElementWidth: function() {
    return this.getVideoPlayerEl().parentElement.parentElement.offsetWidth;
  },

  hello: function() {
    console.log("hello world");
  },

  render: function() {
    console.log("render Video");

    var self = this;

    var videoPlayerClasses = cx({
      "video-js": true,
      "col-lg-6 col-md-6 col-sm-6 col-sm-6": true,
      "fix-height": true,
      "vjs-default-skin": this.props.vjsDefaultSkin,
      "vjs-big-play-centered": this.props.vjsBigPlayCentered
    });

    return (
      <div>
        <video ref={"player"} className={videoPlayerClasses} id={"player"}>
          {this.props.children || this.renderDefaultWarning()}
        </video>
        <ol className="vjs-playlist col-lg-3 col-md-3 col-sm-3 col-sm-3 fix-height" id={"playlist"+this.props.index}>
        </ol>
        <button type="button" className="btn btn-warning" onClick={self.handleClick}>OH
        </button>
      </div>
    );
  }
});

module.exports = Video;
