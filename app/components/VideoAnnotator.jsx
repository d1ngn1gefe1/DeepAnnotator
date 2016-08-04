import React from "react";
import videojs from "video.js";
import "videojs-playlist";
import "videojs-playlist-ui";
import "videojs-framebyframe"
import boundProperties from "./video/bound-properties.js";
import mediaEvents from "./video/media-events.js";
import mediaProperties from "./video/media-properties.js";
import {Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter} from "react-modal-bootstrap"
import {Layer, Rect, Stage, Group} from "react-konva";

import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import FrameLabel from "./FrameLabel.jsx";
import ObjectLabel from "./ObjectLabel.jsx";
import Box from "./Box.jsx";

import "video.js/dist/video-js.min.css";
import "videojs-playlist-ui/dist/videojs-playlist-ui.vertical.css";

// don't change these!
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
      labelInfos: [],
      currentLabels: [],
      serverData: [],
      initFrameLabels: [],
      initObjectLabels: [],
      currentFrame: 0,
      numFrames: 0,
      currentItem: -1,
      isOpen: false,
      isPlaying: false,
      isSaved: true,
      labelToBoxData: []
    };

    this.currentKey = 0;

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
    this.handleCloseLabel = this.handleCloseLabel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleOK = this.handleOK.bind(this);

    this.selectOptions = [{
    	label: "Alcohol Rub",
    	options: [{
    		label: "No attempt",
    		value: "no attempt"
    	}, {
    		label: "Insufficient rub",
    		value: "insufficient rub"
    	}, {
    		label: "Sufficient rub",
    		value: "sufficient rub"
    	}]
    }, {
    	label: "Soup and Water Wash",
    	options: [{
    		label: "No attempt",
    		value: "no attempt"
    	}, {
    		label: "Insufficient rub",
    		value: "insufficient rub"
    	}, {
    		label: "Sufficient rub",
    		value: "sufficient rub"
    	}]
    }];
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
      autoplay: false,
      plugins: {
        framebyframe: {
          fps: 5,
          steps: [
            { text: "-5", step: -5 },
            { text: "-1", step: -1 },
            { text: "+1", step: 1 },
            { text: "+5", step: 5 },
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
      var currentItem = parseInt(self.player.currentSrc().split("/")[6]);

      if (currentItem == self.state.currentItem) {
        return;
    } else if (!self.state.isSaved) {
        self.setState({
          isOpen: true
        });
      } else {
        self.setState({
          labelInfos: [],
          currentLabels: [],
          currentFrame: 0,
          currentItem: currentItem,
          isOpen: false,
          isPlaying: false,
          isSaved: true
        });
        // Reinitialize labels from server when saved and go to next video or
        // load page for the first time
        self.getVideoInfo();
        self.drawObjects();
      }
    });

    self.player.on("durationchange", function() {
      console.log("durationchange");
      self.setState({
        numFrames: Math.round(self.player.duration()*FPS)
      });
    });

    self.player.on("play", function() {
      console.log("disable");
      self.setState({
        isPlaying: true
      });
    });

    self.player.on("pause", function() {
      console.log("enable");
      self.setState({
        isPlaying: false
      });
    });

    // TODO
    self.player.on("timeupdate", function() {
      var currentLabels = [];
      var currentFrame = Math.round(self.player.currentTime()*FPS);

      for (var i = 0; i < self.state.labelInfos.length; i++) {
        var option = self.refs["label"+i].getCurrentOption(currentFrame);

        currentLabels.push({
          id: i,
          isFrameLabel: self.state.labelInfos[i].isFrameLabel,
          option: option // 0 - 1 for frame labels, 0 - 2 for object labels
        });
      }

      self.setState({
        currentLabels: currentLabels,
        currentFrame: currentFrame
      });
    });
  }

  drawObjects() {
    var stage = this.refs.stage.getStage();
    var layer = this.refs.layer;
    stage.add(layer);

    var layerDom = document.getElementById("layer");
    console.log("Layer:", layerDom);
  }

  getVideoInfo() {
    console.log(this.props.url);

    var self = this;
    fetch(this.props.url, {method: "post"})
      .then(function(response) {
        return response.json(); })
      .then(function(data) {
         self.setState({
           serverData: data.data
         });
         console.log("Load Json:", self.state.serverData);
         self.initLabeledVideos();
         self.markLabeledVideos();
       });
  }

  markLabeledVideos() {
      var self = this;
      var serverData = self.state.serverData;
      var playlist = document.getElementsByClassName("vjs-playlist")[0];
      console.log("Current playlist:", playlist);

      for (var i = 0; i < serverData.length; i++) {
        if (self.playlistName == serverData[i].playlistName) {
          var frameLabel = JSON.parse(serverData[i].frameLabel)["label"];
          var objectLabel = JSON.parse(serverData[i].objectLabel)["label"];
          var count = 0;
          var tag = "";
          if (frameLabel.length > 0) { count++; }
          if (objectLabel.length > 0) { count++; }
          if (count == 1) {
            tag = "glyphicon glyphicon-pencil";
          } else if (count == 2) {
            tag = "glyphicon glyphicon-ok";
          }

          var index = serverData[i].videoId;
          if (playlist.childNodes[index].childNodes.length <= 2) {
            var span = document.createElement("span");
            span.setAttribute("class", tag);
            playlist.childNodes[index].appendChild(span);
          }
        }
      }
  }

  initLabeledVideos() {
      var self = this;
      var serverData = self.state.serverData;
      var labelInfos = Array();
      var frameLabel = Array();
      var objectLabel = Array();
      var currentItem = parseInt(self.player.currentSrc().split("/")[6]);
      console.log("Src currentItem", currentItem);

      for (var i = 0; i < serverData.length; i++) {
        if (self.playlistName == serverData[i].playlistName &&
            currentItem == serverData[i].videoId) {
          frameLabel.push.apply(frameLabel,
            JSON.parse(serverData[i].frameLabel)["label"]);
          objectLabel.push.apply(objectLabel,
            JSON.parse(serverData[i].objectLabel)["label"]);
          console.log("Frame label:", frameLabel);
          console.log("Object label:", objectLabel);

          for (var j = 0; j < frameLabel.length; j++) {
            labelInfos.push({
              isFrameLabel: true,
              key: self.currentKey++
            });
          }

          for (var k = 0; k < objectLabel.length; k++) {
            labelInfos.push({
              isFrameLabel: false,
              key: self.currentKey++
            });
          }
          console.log("labelInfos:", labelInfos);
        }
      }

      self.setState({
        labelInfos: labelInfos,
        initFrameLabels: frameLabel,
        initObjectLabels: objectLabel,
      });

      self.initLabels();
  }

  initLabels() {
    var self = this;
    var initFrameLabels = self.state.initFrameLabels;
    var initObjectLabels = self.state.initObjectLabels;

    for (var i = 0; i < initFrameLabels.length; i++) {
      self.refs["label"+i].setData(initFrameLabels[i]);
      console.log("Frame labels:", self.refs["label"+i]);
    }

    var offset = initFrameLabels.length;
    for (var i = 0; i < initObjectLabels.length; i++) {
      var index = offset + i;
      self.refs["label"+index].setData(initObjectLabels[i]);
      console.log("Object labels:", self.refs["label"+index]);
    }
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
      currentLabels: [],
      currentFrame: 0,
      currentItem: currentItem,
      isOpen: false,
      isPlaying: false,
      isSaved: true
    });
    console.log("currentItem: ", currentItem);

    // Not saved but still want to go to the next video
    self.getVideoInfo();
  }

  handleCloseLabel(id) {
    console.log("close", id);
    var self = this;
    var labelInfos = self.state.labelInfos;

    labelInfos.splice(id, 1);

    self.setState({
      labelInfos: labelInfos,
      isSaved: false
    });
  }

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;
    var labelInfos = self.state.labelInfos;

    labelInfos.push({
      isFrameLabel: true,
      key: self.currentKey
    });
    self.currentKey += 1;

    self.setState({
      labelInfos: labelInfos
    });
  }

  handleNewObjectLabels() {
    console.log("new object labels");
    var self = this;
    var labelInfos = self.state.labelInfos;

    labelInfos.push({
      isFrameLabel: false,
      key: self.currentKey
    });
    self.currentKey += 1;

    self.setState({
      labelInfos: labelInfos,
      isSaved: false
    });
  }

  handleSave() {
    var self = this;
    var frameData = [];
    var objectData = [];
    var frameData;
    var objectData;

    for (var i = 0; i < self.state.labelInfos.length; i++) {
      var labels = self.refs["label"+i].getData();
      console.log("Save data:", labels);
      if (self.state.labelInfos[i]["isFrameLabel"]) {
        frameData.push(labels);
      } else {
        objectData.push(labels);
      }
    }

    // Send data to server
    var frameLabel = {label: frameData};
    var objectLabel = {label: objectData};
    fetch(this.props.urlLabel, {
      method: "post",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        videoId: self.state.currentItem,
        playlistName: self.playlistName,
        frameLabel: JSON.stringify(frameLabel),
        objectLabel: JSON.stringify(objectLabel),})
    })
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()));

    self.setState({
      isSaved: true
    });
  }

  handleIsSaved(isSaved) {
    console.log("handleIsSaved");
    var self = this;

    self.setState({
      isSaved: isSaved
    });
  }

  render() {
    var self = this;
    console.log("render");
    var numFrameLabels = 0;

    return (
      <div className="container-fluid video-annotator">
        <AnnotatorNavigation description={self.playlistName+", "+self.start+" - "+(self.end-1)}/>

        <section className="main-preview-player row row-eq-height clearfix">
          <div className="control-panel col-lg-4 col-md-4 col-sm-4">
            <div className="row control-panel-buttons">
              <button type="button" className="btn btn-frame new-frame-labels" onClick={self.handleNewFrameLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Frame Labels
              </button>
              <button type="button" className="btn btn-object new-object-labels" onClick={self.handleNewObjectLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> Object Labels
              </button>
              <button type="button" className="btn btn-save save" onClick={self.handleSave}>
                <span className="glyphicon glyphicon glyphicon-floppy-disk"></span> Save <span className={self.state.isSaved?"saved":"unsaved"}>●</span>
              </button>
            </div>
            {
              self.state.labelInfos.map(function(labelInfo, index) {
                if (labelInfo.isFrameLabel) {
                  return (
                    <FrameLabel key={labelInfo.key} id={index}
                      ref={"label"+index} currentFrame={self.state.currentFrame}
                      closeLabel={self.handleCloseLabel} notSaved={self.handleIsSaved.bind(self, false)}
                      saved={self.handleIsSaved.bind(self, true)} numFrames={self.state.numFrames}
                      isPlaying={self.state.isPlaying} selectOptions={self.selectOptions} />
                  );
                } else {
                  return (
                    <ObjectLabel key={labelInfo.key} id={index}
                      ref={"label"+index} currentFrame={self.state.currentFrame}
                      closeLabel={self.handleCloseLabel} notSaved={self.handleIsSaved.bind(self, false)}
                      saved={self.handleIsSaved.bind(self, true)} numFrames={self.state.numFrames}
                      isPlaying={self.state.isPlaying} selectOptions={self.selectOptions} />
                  );
                }
              })
            }
          </div>

          <div className="videojs-wrapper col-lg-6 col-md-6 col-sm-6">
            <div className={"small-label-frame bg-gray"}>{self.state.currentFrame+"/"+self.state.numFrames}</div>

            <Stage ref="stage" width={WIDTH*SCALING} height={HEIGHT*SCALING} className="canvas-wrapper">
              <Layer ref="layer" id="layer">
              {
                self.state.labelInfos.map(function(labelInfo, index) {
                  if (!labelInfo.isFrameLabel) {
                    return (
                      <Box key={labelInfo.key} ref={"box"+index} id={index} currentFrame={self.state.currentFrame} currentOption={(self.state.currentLabels[index])?self.state.currentLabels[index].option:0}/>
                    );
                  }
                })
              }
              </Layer>
            </Stage>

            {
              self.state.currentLabels.map(function(currentLabel, index) {
                var bg;

                if (currentLabel.isFrameLabel) {
                  numFrameLabels++;
                  if (currentLabel.option == 0) {
                    bg = " bg-gray";
                  } else if (currentLabel.option == 1) {
                    bg = " bg-danger";
                  }
                  return (
                    <div className={"small-label"+bg} key={index} style={{left: 76*(numFrameLabels-1)+"px"}}>{"Frame"+currentLabel.id}</div>
                  );
                } else {
                  if (currentLabel.option == 0) {
                    bg = " bg-success";
                  } else if (currentLabel.option == 1) {
                    bg = " bg-info";
                  } else if (currentLabel.option == 2) {
                    bg = " bg-danger";
                  }
                }
              })
            }

            <video id="player" className="video-js" controls preload="auto" crossOrigin="anonymous">
              <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
            </video>
          </div>

          <ol className="vjs-playlist col-lg-2 col-md-2 col-sm-2"></ol>
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

VideoAnnotator.propTypes = {
  description: React.PropTypes.string
};

VideoAnnotator.defaultProps = {
  url: "/videoInfo",
  urlLabel: "/saveLabel"
};
