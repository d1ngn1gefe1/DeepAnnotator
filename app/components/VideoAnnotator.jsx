import React from "react";
import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import LabelInfo from "./LabelInfo.jsx";
import videojs from "video.js";
import "videojs-playlist";
import "videojs-playlist-ui";
import boundProperties from "./video/bound-properties.js";
import mediaEvents from "./video/media-events.js";
import mediaProperties from "./video/media-properties.js";

var HEIGHT = 240;
var WIDTH = 320;
var SCALING = 2;
var FPS = 5.0;

export default class VideoAnnotator extends React.Component {

  // similar to componentWillMount in ES5
  constructor(props, defaultProps) {
    console.log("VideoAnnotator Contructor");
    super(props, defaultProps);

    this.state = {
      labelInfoLists: [],
      currentFrameLabels: []
    };

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
    this.handleGetCurrentFrame = this.handleGetCurrentFrame.bind(this);
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
    var self = this;

    console.log(this.props.url)
    fetch(this.props.url, {method: "post"})
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()))

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

    self.player = videojs("player", {
      control: true,
      preload: "auto",
      height: HEIGHT*SCALING,
      width: WIDTH*SCALING
    }, function() {
      self.player.playlist(playlist);
      self.player.playlistUi();
      boundProperties(self.player);
      mediaEvents(self.player);
      mediaProperties(self.player);
    });

    self.player.on("loadstart", function() {
      console.log("loadstart");
      self.currentItem = parseInt(self.player.currentSrc().split("/")[6]);
      console.log("currentItem: ", self.currentItem);
    });

    self.player.on("durationchange", function() {
      console.log("durationchange");
      self.numFrames = Math.round(self.player.duration()*FPS);
      console.log("total frames: ", self.numFrames);
    });

    self.player.on("timeupdate", function() {
      var currentFrameLabels = [];
      var update = false;

      for (var i = 0; i < self.state.labelInfoLists.length; i++) {
        if (self.state.labelInfoLists[i].isFrameLabels) {
          var option = self.refs["labelInfo"+i].getCurrentOption(self.handleGetCurrentFrame());
          currentFrameLabels.push({
            id: i,
            option: option
          });
        }
      }

      if (self.state.currentFrameLabels.length != currentFrameLabels.length) {
        update = true;
      } else {
        for (var i = 0; i < currentFrameLabels.length; i++) {
          if (self.state.currentFrameLabels[i].id != currentFrameLabels[i].id || self.state.currentFrameLabels[i].option != currentFrameLabels[i].option) {
            update = true;
            break;
          }
        }
      }

      if (update) {
        self.setState({
          currentFrameLabels: currentFrameLabels
        });
      }
    });
  }

  handleGetCurrentFrame() {
    var self = this;
    return Math.round(self.player.currentTime()*FPS);
  }

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;

    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists.push({
      isFrameLabels: true,
      labelName: "",
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

  render() {
    console.log("VideoAnnotator render");
    var self = this;

    return (
      <div className="container-fluid video-annotator">
        <AnnotatorNavigation description={self.playlistName+", "+self.start+" - "+(self.end-1)}/>

        <section className="main-preview-player row row-eq-height clearfix">
          <div className="control-panel col-lg-4 col-md-4 col-sm-4" style={{height: HEIGHT*SCALING+"px"}}>
            <div className="row control-panel-add-buttons">
              <button type="button" className="btn btn-warning new-frame-labels" onClick={this.handleNewFrameLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Frame Labels
              </button>
              <button type="button" className="btn btn-info new-object-labels" onClick={this.handleNewObjectLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Object Labels
              </button>
            </div>
            {
              self.state.labelInfoLists.map(function(labelInfo, index) {
                return (
                  <LabelInfo key={index} id={index} ref={"labelInfo"+index} isFrameLabels={labelInfo.isFrameLabels} getCurrentFrame={self.handleGetCurrentFrame} numFrames={self.numFrames}/>
                );
              })
            }
          </div>


          <div className="videojs-wrapper col-lg-6 col-md-6 col-sm-6" style={{height: HEIGHT*SCALING+"px"}}>
          {
            self.state.currentFrameLabels.map(function(currentFrameLabel, index) {
              var bg;
              switch (currentFrameLabel.option) {
                case 0:
                  bg = "bg-success";
                  break;
                case 1:
                  bg = "bg-primary";
                  break;
                case 2:
                  bg = "bg-danger";
                  break;
              }
              return (
                <div className={"frame-label "+bg} key={index} style={{left: 76*index+"px"}}>{"Frame "+currentFrameLabel.id}</div>
              );
            })
          }
            <video id="player" className="video-js" controls preload="auto" crossOrigin="anonymous">
              <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
            </video>
          </div>

          <ol className="vjs-playlist col-lg-2 col-md-2 col-sm-2" style={{height: HEIGHT*SCALING+"px"}}></ol>
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
