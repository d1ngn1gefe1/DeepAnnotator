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
      console.log("ready!");

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
  }

  getCurrentFrame() {
    self = this;
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

  handleUpdateOption(id, option) {
    console.log("update option", id, option);
    var self = this;

    var labelInfoLists = self.state.labelInfoLists;
    var currentFrame = self.getCurrentFrame();

    console.log("option: ", option);
    console.log("current frame: ", currentFrame);

    if (labelInfoLists[id].labels.length == 0) {
      labelInfoLists[id].labels.push({
        startFrame: 0,
        option: option,
        length: self.numFrames
      });
    } else {
      for (var i = 0; i < labelInfoLists[id].labels.length; i++) {
        console.log("i=", i);

        if (labelInfoLists[id].labels[i].startFrame == currentFrame) { // same frame, update option
          if (i >= 1 && labelInfoLists[id].labels[i-1].option == option) {
            labelInfoLists[id].labels[i-1].length += labelInfoLists[id].labels[i].length
            labelInfoLists[id].labels.splice(i, 1);
          } else {
            labelInfoLists[id].labels[i].option = option;
          }
          break;
        } else if (labelInfoLists[id].labels[i].startFrame > currentFrame) { // insert
          if (labelInfoLists[id].labels[i].option == option) { // option same as next
            labelInfoLists[id].labels[i].length += labelInfoLists[id].labels[i].startFrame-currentFrame;
            labelInfoLists[id].labels[i-1].length -= labelInfoLists[id].labels[i].startFrame-currentFrame;
            labelInfoLists[id].labels[i].startFrame = currentFrame;
          } else if (labelInfoLists[id].labels[i-1].option != option) { // option same as prev
            labelInfoLists[id].labels[i-1].length -= labelInfoLists[id].labels[i].startFrame-currentFrame;
            labelInfoLists[id].labels.splice(i, 0, {
              startFrame: currentFrame,
              option: option,
              length: labelInfoLists[id].labels[i].startFrame-currentFrame
            });
          }
          break;
        } else if (i == labelInfoLists[id].labels.length-1) { // append
          if (labelInfoLists[id].labels[i].option != option) {
            labelInfoLists[id].labels[i].length -= self.numFrames-currentFrame;
            labelInfoLists[id].labels.push({
              startFrame: currentFrame,
              option: option,
              length: self.numFrames-currentFrame
            });
          }
          break;
        }
      }
    }

    console.log(id);
    console.log(labelInfoLists[id].labels);

    self.setState({
      labelInfoLists: labelInfoLists
    });
  }

  render() {
    console.log("VideoAnnotator render!!");
    var self = this;

    return (
      <div className="container-fluid">
        <AnnotatorNavigation description={self.playlistName+", "+self.start+" - "+(self.end-1)}/>

        <section className="main-preview-player row row-eq-height clearfix">
          <div className="control-panel col-lg-3 col-md-3 col-sm-3" style={{height: HEIGHT*SCALING+"px"}}>
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

        {
          self.state.labelInfoLists.map(function(labelInfo, indexLabelInfo) {
            var sum = 0;
            var percentage = 0;
            if (labelInfo.isFrameLabels) {
              return (
                <div className="progress" key={indexLabelInfo}>
                  {
                    labelInfo.labels.map(function (label, indexLabel) {
                      if (indexLabel == labelInfo.labels.length-1) {
                        percentage = 100-sum;
                      } else {
                        percentage = Math.round(100*label.length/self.numFrames);
                        sum += percentage;
                      }
                      var color = "";
                      switch (label.option) {
                        case 0:
                          color = "progress-bar-success";
                          break;
                        case 1:
                          color = "progress-bar-warning";
                          break;
                        case 2:
                          color = "progress-bar-danger";
                          break;
                        default:
                          break;
                      }
                      return (
                        <div className={"progress-bar "+color} key={indexLabel} style={{width: percentage+"%"}}>
                          <span className="sr-only">ABCDEFG</span>
                        </div>
                      );
                    })
                  }
                </div>
              );
            }
          })
        }

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
