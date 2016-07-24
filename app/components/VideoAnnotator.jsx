import React from "react";
import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import LabelInfo from './LabelInfo.jsx';
var vjs = require("video.js");
var vjsPlaylist = require("videojs-playlist");
var vjsPlaylistUI = require("videojs-playlist-ui");
import playlist from './video/playlist.js';
import boundProperties from './video/bound-properties.js';
import mediaEvents from './video/media-events.js';
import mediaProperties from './video/media-properties.js';

export default class VideoAnnotator extends React.Component {

  // similar to componentWillMount in ES5
  constructor(props, defaultProps) {
    console.log("VideoAnnotator Contructor");
    super(props, defaultProps);

    this.state = {
      labelInfoLists: []
    };

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
  }

  componentWillMount() {
    console.log("VideoAnnotator componentWillMount");
    this.playlistName = this.props.params.playlistName;
    var range = this.props.params.range.split("-");
    this.start = parseInt(range[0]);
    this.end = parseInt(range[1])+1; // exclusive
  }

  componentDidMount() {
    console.log("VideoAnnotator componentDidMount");
    self = this;

    console.log(this.props.url)
    fetch(this.props.url, {method: 'post'})
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()))

    self.player = vjs('preview-player', {
      fluid: true
    });

    self.player.on('loadstart', function() {
      const pl = self.player.playlist();
      const plitem = pl[self.player.playlist.currentItem()];
    });

    self.player.playlist(playlist);
    self.player.playlistUi();

    boundProperties(self.player);
    mediaEvents(self.player);
    mediaProperties(self.player);
  }

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;

    self.setState({
      labelInfoLists: self.state.labelInfoLists.concat({
        isFrameLabels: false
      })
    });
  }

  handleNewObjectLabels() {
    console.log("new object labels");
    var self = this;

    self.setState({
      labelInfoLists: self.state.labelInfoLists.concat({
        isFrameLabels: true
      })
    });
  }

  render() {
    console.log("VideoAnnotator render");
    var self = this;

    return (
      <div>
        <section className="main-preview-player">
          <video id="preview-player" className="video-js vjs-fluid" controls preload="auto" crossOrigin="anonymous">
            <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
          </video>

          <div className="playlist-container preview-player-dimensions vjs-fluid">
            <ol className="vjs-playlist"></ol>
          </div>
        </section>
        <section className="details">
          <div className="bound-properties"></div>
          <div className="media-properties"></div>
          <div className="media-events"></div>
        </section>
      </div>
    );
  }
}

VideoAnnotator.defaultProps = { url: '/videoInfo' };
