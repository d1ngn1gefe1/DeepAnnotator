import React from "react";
import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import LabelInfo from "./LabelInfo.jsx";
import videojs from "video.js";
import "videojs-playlist";
import "videojs-playlist-ui";
import "./videojs.framebyframe.js";
import boundProperties from "./video/bound-properties.js";
import mediaEvents from "./video/media-events.js";
import mediaProperties from "./video/media-properties.js";
import {Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter} from "react-modal-bootstrap"

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
      currentLabels: [],
      currentItem: -1,
      isOpen: false
    };

    this.currentKey = 0;
    this.isSaved = true;

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
    this.handleGetCurrentFrame = this.handleGetCurrentFrame.bind(this);
    this.handleCloseLabelInfo = this.handleCloseLabelInfo.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleNotSaved = this.handleNotSaved.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOK = this.handleOK.bind(this);
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
      .then(response => response.json())
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
      width: WIDTH*SCALING,
      plugins: {
        framebyframe: {
          fps: 5,
          steps: [
            { text: '-5', step: -5 },
            { text: '-1', step: -1 },
            { text: '+1', step: 1 },
            { text: '+5', step: 5 },
          ]
        }
      }
    }, function() {
      self.player.playlist(playlist);
      self.player.playlistUi();
      boundProperties(self.player);
      mediaEvents(self.player);
      mediaProperties(self.player);
    });

    self.player.on("loadstart", function() {
      console.log("loadstart, is saved: ", self.isSaved);

      var currentItem = parseInt(self.player.currentSrc().split("/")[6]);

      if (currentItem == self.state.currentItem) {
        return;
      } else if (!self.isSaved) {
        self.setState({
          isOpen: true
        });
      } else {
        self.setState({
          labelInfoLists: [],
          currentLabels: [],
          currentItem: currentItem,
          isOpen: false
        });
        console.log("currentItem: ", currentItem);
      }
    });

    self.player.on("durationchange", function() {
      console.log("durationchange");
      self.numFrames = Math.round(self.player.duration()*FPS);
      console.log("total frames: ", self.numFrames);
    });

    self.player.on("timeupdate", function() {
      var currentLabels = [];
      var update = false;

      for (var i = 0; i < self.state.labelInfoLists.length; i++) {
        var option = self.refs["labelInfo"+i].getCurrentOption(self.handleGetCurrentFrame());

        currentLabels.push({
          id: i,
          isFrameLabels: self.state.labelInfoLists[i].isFrameLabels,
          option: option // 0 - 2 for object labels, 0 - 1 for frame labels
        });
      }

      if (self.state.currentLabels.length != currentLabels.length) {
        update = true;
      } else {
        for (var i = 0; i < currentLabels.length; i++) {
          if (self.state.currentLabels[i].option != currentLabels[i].option) {
            update = true;
            break;
          }
        }
      }

      if (update) {
        self.setState({
          currentLabels: currentLabels
        });
      }
    });
  }

  handleCancel() {
    var self = this;

    self.setState({
      isOpen: false
    });
    self.player.playlist.currentItem(self.state.currentItem);
  }

  handleOK() {
    var self = this;

    var currentItem = parseInt(self.player.currentSrc().split("/")[6]);
    self.setState({
      labelInfoLists: [],
      currentLabels: [],
      currentItem: currentItem,
      isOpen: false
    });
    self.isSaved = true;
    console.log("currentItem: ", currentItem);
  }

  handleCloseLabelInfo(id) {
    console.log("close", id);
    var self = this;
    self.isSaved = false;

    var labelInfoLists = self.state.labelInfoLists;

    labelInfoLists.splice(id, 1);

    self.setState({
      labelInfoLists: labelInfoLists,
    });
  }

  handleGetCurrentFrame() {
    var self = this;
    return Math.round(self.player.currentTime()*FPS);
  }

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;
    self.isSaved = false;

    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists.push({
      isFrameLabels: true,
      labels: [],
      key: self.currentKey
    });

    self.currentKey += 1;

    self.setState({
      labelInfoLists: labelInfoLists
    });
  }

  handleNewObjectLabels() {
    console.log("new object labels");
    var self = this;
    self.isSaved = false;

    var labelInfoLists = self.state.labelInfoLists;
    labelInfoLists.push({
      isFrameLabels: false,
      labels: [],
      key: self.currentKey
    });

    self.currentKey += 1;

    self.setState({
      labelInfoLists: labelInfoLists
    });
  }

  handleSave() {
    var self = this;
    var data = [];

    for (var i = 0; i < self.state.labelInfoLists.length; i++) {
      var labels = self.refs["labelInfo"+i].getLabels();
      data.push(labels);
    }

    // Send data to server
    var label = {label: data}
    fetch(this.props.urlFrame, {
      method: "post",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        videoId: self.state.currentItem,
        playlistName: self.playlistName,
        label: JSON.stringify(label), })
    })
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()));

    console.log("saved");
    console.log(data);
  }

  handleNotSaved() {
    this.isSaved = false;
  }

  render() {
    console.log("VideoAnnotator render!");
    var self = this;

    return (
      <div className="container-fluid video-annotator">
        <AnnotatorNavigation description={self.playlistName+", "+self.start+" - "+(self.end-1)}/>

        <section className="main-preview-player row row-eq-height clearfix">
          <div className="control-panel col-lg-4 col-md-4 col-sm-4" style={{height: HEIGHT*SCALING+"px"}}>
            <div className="row control-panel-buttons">
              <button type="button" className="btn btn-frame new-frame-labels" onClick={self.handleNewFrameLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Frame Labels
              </button>
              <button type="button" className="btn btn-object new-object-labels" onClick={self.handleNewObjectLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Object Labels
              </button>
              <button type="button" className="btn btn-save save" onClick={self.handleSave}>
                <span className="glyphicon glyphicon glyphicon-floppy-disk"></span> Save
              </button>
            </div>
            {
              self.state.labelInfoLists.map(function(labelInfo, index) {
                return (
                  <LabelInfo key={labelInfo.key} id={index} ref={"labelInfo"+index} isFrameLabels={labelInfo.isFrameLabels} getCurrentFrame={self.handleGetCurrentFrame} closeLabelInfo={self.handleCloseLabelInfo} notSaved={self.handleNotSaved} numFrames={self.numFrames} />
                );
              })
            }
          </div>


          <div className="videojs-wrapper col-lg-6 col-md-6 col-sm-6" style={{height: HEIGHT*SCALING+"px"}}>
          {
            self.state.currentLabels.map(function(currentLabel, index) {
              var bg;

              switch (currentLabel.option) {
                case 0:
                  if (currentLabel.isFrameLabels) {
                    bg = "bg-gray";
                  } else {
                    bg = "bg-success";
                  }
                  break;
                case 1:
                  if (currentLabel.isFrameLabels) {
                    bg = "bg-success";
                  } else {
                    bg = "bg-info";
                  }
                  break;
                case 2:
                  bg = "bg-danger";
                  break;
              }

              return (
                <div className={"small-label "+bg} key={index} style={{left: 76*index+"px"}}>{(currentLabel.isFrameLabels?"Frame":"Object")+currentLabel.id}</div>
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

        <Modal isOpen={self.state.isOpen} onRequestHide={self.handleCancel}>
          <ModalHeader>
            <ModalClose onClick={self.handleCancel}/>
            <ModalTitle>Friendly Reminder</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to navigate away from this video and discard the changes?</p>
            <p>Press OK to continue, or Cancel to stay on the current page.</p>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-default" onClick={self.handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={self.handleOK}>
              OK
            </button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

AnnotatorNavigation.propTypes = {
  description: React.PropTypes.string.isRequired
};

VideoAnnotator.defaultProps = {
  url: "/videoInfo",
  urlFrame: "/saveLabel"
};
