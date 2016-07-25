import React from "react";
import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import LabelInfo from "./LabelInfo.jsx";
var vjs = require("video.js");
var vjsPlaylist = require("videojs-playlist");
var vjsPlaylistUI = require("videojs-playlist-ui");
import boundProperties from "./video/bound-properties.js";
import mediaEvents from "./video/media-events.js";
import mediaProperties from "./video/media-properties.js";

var HEIGHT = 240;
var WIDTH = 320;
var SCALING = 2;

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
    this.handleUpdateOption = this.handleUpdateOption.bind(this);
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
    fetch(this.props.url, {method: "post"})
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()))

    self.player = vjs("player", {
      fluid: true,
      height: HEIGHT*SCALING,
      width: WIDTH*SCALING
    });

    self.player.on("loadstart", function() {
      const pl = self.player.playlist();
      const plitem = pl[self.player.playlist.currentItem()];
    });

    var playlist = [];

    for (var i = self.start; i < self.end; i++) {
      playlist.push({
        "sources": [{
          "src": "/static/video/"+self.playlistName+"/"+i+"/depth.mp4", "type": "video/mp4"
        }],
        "name": "Video "+i,
        "thumbnail": "/static/video/"+self.playlistName+"/"+i+"/thumbnail.jpg"
      });
    }

    self.player.playlist(playlist);
    self.player.playlistUi();

    boundProperties(self.player);
    mediaEvents(self.player);
    mediaProperties(self.player);

    self.player.on("suspend", function() {
      self.currentItem = parseInt(self.player.currentSrc().split("/")[6]);
      console.log("currentItem: ", self.currentItem);
    });

    self.player.on("timeupdate", function() {

    });
  }

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;

    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists.push({
      isFrameLabels: true,
      labels: []
    });
    self.setState({
      labelInfoLists: labelInfoLists
    });
  }

  handleNewObjectLabels() {
    console.log("new object labels");
    var self = this;

    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists.push({
      isFrameLabels: false,
      labels: []
    });
    self.setState({
      labelInfoLists: labelInfoLists
    });
  }

  handleUpdateOption(id, option) {
    self = this;

    console.log("update option", id, option);
    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists[id].labels.push({
      option: option,
      time: self.player.currentTime()
    });
    self.setState({
      labelInfoLists: labelInfoLists
    });
    console.log(self.state.labelInfoLists);
  }

  render() {
    console.log("VideoAnnotator render!!!");
    var self = this;

    return (
      <div className="container-fluid">
        <AnnotatorNavigation description={self.playlistName+", "+self.start+" - "+(self.end-1)}/>

        <section className="main-preview-player row row-eq-height clearfix">
          <div className="control-panel col-lg-3 col-md-3 col-sm-3" style={{height: HEIGHT*SCALING+"px"}}>
            <div className="row control-panel-add-buttons">
              <button type="button" className="btn btn-warning new-frame-labels" onClick={this.handleNewFrameLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> New Frame Labels
              </button>
              <button type="button" className="btn btn-info new-object-labels" onClick={this.handleNewObjectLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> New Object Labels
              </button>
            </div>
            {
              self.state.labelInfoLists.map(function(labelInfo, index) {
                return (
                  <LabelInfo key={index} id={index} isFrameLabels={labelInfo.isFrameLabels} updateOption={self.handleUpdateOption}/>
                );
              })
            }
          </div>

          <video id="player" className="video-js col-lg-6 col-md-6 col-sm-6" controls preload="auto" crossOrigin="anonymous" style={{height: HEIGHT*SCALING+"px"}}>
            <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
          </video>

          <ol className="vjs-playlist col-lg-3 col-md-3 col-sm-3" style={{height: HEIGHT*SCALING+"px"}}></ol>
        </section>

        <section className="details">
          <div className="bound-properties col-lg-4 col-md-4 col-sm-4"></div>
          <div className="media-properties col-lg-4 col-md-4 col-sm-4"></div>
          <div className="media-events col-lg-4 col-md-4 col-sm-4"></div>
        </section>
      </div>
    );
  }
}

AnnotatorNavigation.propTypes = {
  description: React.PropTypes.string.isRequired
};

VideoAnnotator.defaultProps = { url: "/videoInfo" };
