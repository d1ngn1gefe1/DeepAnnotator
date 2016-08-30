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
import Select from "react-select-plus";

import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import FrameLabel from "./FrameLabel.jsx";
import ObjectLabel from "./ObjectLabel.jsx";
import Box from "./Box.jsx";
import Nouislider from "./slider/NouisliderWrapper.jsx";

import "video.js/dist/video-js.min.css";
import "videojs-playlist-ui/dist/videojs-playlist-ui.vertical.css";
import "react-select-plus/dist/react-select-plus.css";

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
      serverData: [],
      initFrameLabels: [],
      initObjectLabels: [],
      initBoxes: [],
      currentFrame: 0,
      numFrames: 0,
      currentItem: -1,
      isSaveModalOpen: false,
      isInstructionsModalOpen: false,
      isPlaying: false,
      isSaved: true,
      labelToBoxData: [],
      objectSelectOptions: [],
      frameSelectOptions: [],
      categories: null,
      playbackRate: 1.0,
      showAdvanced: false,
      frameCatVal: "",
      frameClassVal: "",
      frameCategoryRemove: null,
      frameCategoryAdd: null,
      frameSelect: null,
      objectSelect: null,
      objTextVal: ""
    };

    this.currentKey = 0;
    this.currentLabels = [];
    this.isFocus = false;

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
    this.handleCloseLabel = this.handleCloseLabel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveModalCancel = this.handleSaveModalCancel.bind(this);
    this.handleSaveModalOK = this.handleSaveModalOK.bind(this);
    this.handleInstructionsModalCancel = this.handleInstructionsModalCancel.bind(this);
    this.handleSetCurrentFrame = this.handleSetCurrentFrame.bind(this);
    this.handleAddObjectSelectOptions = this.handleAddObjectSelectOptions.bind(this);
    this.handleAddFrameCategory = this.handleAddFrameCategory.bind(this);
    this.handleAddFrameClass = this.handleAddFrameClass.bind(this);
    this.handleChangePlaybackRate = this.handleChangePlaybackRate.bind(this);
    this.handleShowAdvanced = this.handleShowAdvanced.bind(this);
    this.handleIsSaved = this.handleIsSaved.bind(this);
    this.handleFrameSelectRemove = this.handleFrameSelectRemove.bind(this);
    this.handleFrameSelectAdd = this.handleFrameSelectAdd.bind(this);
    this.handleObjectSelect = this.handleObjectSelect.bind(this);
    this.handleOpenInstructionsModal = this.handleOpenInstructionsModal.bind(this);
    this.handleObjTextChange = this.handleObjTextChange.bind(this);
    this.handleRemoveObjectSelectOptions = this.handleRemoveObjectSelectOptions.bind(this);
    this.handleFrameCatChange = this.handleFrameCatChange.bind(this);
    this.handleFrameClassChange = this.handleFrameClassChange.bind(this);
    this.handleRemoveFrameClass = this.handleRemoveFrameClass.bind(this);
    this.handleClickPlaylist = this.handleClickPlaylist.bind(this);
  }

  componentWillMount() {
    console.log("VideoAnnotator componentWillMount");
    this.playlistName = this.props.params.playlistName;
    console.log(this.playlistName);
    var range = this.props.params.range.split("-");
    console.log(range);
    this.start = parseInt(range[0]);
    this.end = parseInt(range[1])+1; // exclusive
  }

  componentDidMount() {
    console.log("VideoAnnotator componentDidMount");
    var self = this;

    var playlist = [];
    for (var i = self.start; i < self.end; i++) {
      playlist.push({
        sources: [{
          src: "http://aicare.stanford.edu/static/video/"+self.playlistName+"/"+i+"/depth.mp4",
          type: "video/mp4"
        }],
        name: "Video "+i,
        thumbnail: "/static/video/"+self.playlistName+"/"+i+"/thumbnail.jpg",
        poster: "/static/video/"+self.playlistName+"/"+i+"/thumbnail.jpg"
      });
    }

    self.player = videojs("player", {
      plugins: {
        framebyframe: {
          fps: FPS,
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

      self.player.on("canplaythrough", function() {
        console.log("canplaythrough");
      });

      self.player.on("loadedmetadata", function() {
        console.log("loadedmetadata");
      });

      self.player.on("loadstart", function() {
        console.log("loadstart", self.player.playlist.currentItem());
      });

      self.player.on("canplay", function() {
        console.log("canplay");
      });

      self.player.on("loadeddata", function() {
        console.log("loadeddata");
        var currentItem = parseInt(self.player.currentSrc().split("/")[6]);

        if (self.player.seekable().end(0) == 0) {
          console.log("error: not seekable");
        }

        if (currentItem == self.state.currentItem) {
          return;
        } else if (!self.state.isSaved) {
          self.setState({
            isSaveModalOpen: true
          });
        } else {
          self.setState({
            labelInfos: [],
            currentFrame: 0,
            currentItem: currentItem,
            isSaveModalOpen: false,
            isPlaying: false,
            isSaved: true
          });

          self.player.pause();

          self.getOptionsInfo();
          // Reinitialize labels from server when saved and go to next video or
          // load page for the first time
          self.getVideoInfo();
          self.markCurrentVideo();
        }
      });

      self.player.on("durationchange", function() {
        console.log("durationchange");
        self.setState({
          numFrames: Math.round(self.player.duration()*FPS)
        });
      });

      self.player.on("playing", function() {
        self.setState({
          isPlaying: true
        });
      });
      self.player.on("pause", function() {
        self.setState({
          isPlaying: false
        });
      });

      self.player.on("timeupdate", function() {
        var currentFrame = Math.round(self.player.currentTime()*FPS);

        self.setState({
          currentFrame: currentFrame
        });
      });

      boundProperties(self.player);
      mediaEvents(self.player);
      mediaProperties(self.player);
    });

    window.onpopstate = function(e) {
      console.log("Back button pressed!");
      window.location.href = "/";
    };

    window.onkeydown = function(e) {
      if (e.keyCode == 37) { // left
        if (self.isFocus) {
          return true;
        }
        self.player.pause();
        var dist = 5.0/FPS;
        self.player.currentTime(self.player.currentTime()-dist);
      } else if (e.keyCode == 39) { // right
        if (self.isFocus) {
          return true;
        }
        self.player.pause();
        var dist = 5.0/FPS;
        self.player.currentTime(self.player.currentTime()+dist);
      } else if (e.keyCode == 32) { // space
        if (self.player.paused()) {
          setTimeout(function () {
            self.player.play();
          }, 150);
        } else {
          setTimeout(function () {
            self.player.pause();
          }, 150);
        }
        return false;
      } else if(e.ctrlKey && e.keyCode == 83) { // ctrl + s
        self.handleSave();
        return false;
      }
    };
  }

  handleClickPlaylist() {
    var items = document.getElementsByClassName("vjs-playlist-item");
    for (var i = 0; i < items.length; i++) {
      items[i].blur();
    }
  }

  componentWillUpdate() {
    var self = this;

    for (var i = 0; i < self.state.labelInfos.length; i++) {
      if (!self.refs["label"+i]) {
        continue;
      }
      var option = self.refs["label"+i].getCurrentOption();

      self.currentLabels[i] = {
        isFrameLabel: self.state.labelInfos[i].isFrameLabel,
        option: option // 0 - 1 for frame labels, 0 - 2 for object labels
      };
    }
  }

  getOptionsInfo() {
    var self = this;

    fetch(this.props.urlOptions, {method: "post"})
      .then(function(response) {
        return response.json(); })
      .then(function(options) {
         console.log("Option info:", options);
         var categories = self.getCategories(options.frame_options)
         self.setState({
           frameSelectOptions: options.frame_options,
           objectSelectOptions: options.object_options,
           categories: categories
         })
       });
  }

  saveOptionInfo(frameOptions, objectOptions) {
    var self = this;

    var options = {
      frame_options: frameOptions,
      object_options: objectOptions
    };

    fetch(this.props.urlSaveOptions, {
      method: "post",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options)
    }).then(function(response) {
        return response.text(); })
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()));
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
         console.log("Load Json test:", self.state.serverData);
         self.initLabeledVideos();
         self.markLabeledVideos();
       });
  }

  markCurrentVideo() {
    var self = this;
    var currentItem = parseInt(self.player.currentSrc().split("/")[6]);
    var playlist = document.getElementsByClassName("vjs-playlist")[0];
    console.log("Mark current item:", currentItem);
    console.log("self.start:", self.start);

    for (var i = 0; i < playlist.childNodes.length; i++) {
      var video = playlist.childNodes[i];
      var tag = "glyphicon glyphicon-hand-left";

      for (var j = 0; j < video.childNodes.length; j++) {
        if (video.childNodes[j].className === tag) {
          video.removeChild(video.childNodes[j]);
          break;
        }
      }

      if (parseInt(currentItem) == i + self.start) {
        console.log("Current item:", currentItem);
        var span = document.createElement("span");
        span.setAttribute("class", tag);
        video.appendChild(span);
        console.log("Mark current video span:", span);
        console.log("Mark current video:", video);
      }
    }
  }

  markLabeledVideos() {
      var self = this;
      var serverData = self.state.serverData;
      var playlist = document.getElementsByClassName("vjs-playlist")[0];
      console.log("Current playlist:", playlist);

      for (var i = 0; i < serverData.length; i++) {
        if (self.playlistName == serverData[i].playlistName &&
            serverData[i].videoId >= self.start &&
            serverData[i].videoId < self.end) {
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

          if (count > 0) {
            var index = serverData[i].videoId - self.start;
            console.log("index:", index);
            var node = playlist.childNodes[index];
            var span = document.createElement("span");
            span.setAttribute("class", tag);
            if (node.childNodes.length <= 2) {
              var linebreak = document.createElement("br");
              node.appendChild(span);
              node.appendChild(linebreak);
            } else {
              var className = node.childNodes[2].className;
              if (className === "glyphicon glyphicon-pencil" ||
                  className === "glyphicon glyphicon-ok") {
                node.childNodes[2].setAttribute("class", tag);
              } else {
                var linebreak = document.createElement("br");
                node.insertBefore(span, node.childNodes[2]);
                node.insertBefore(linebreak, node.childNodes[3]);
              }
            }
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
      var bboxes = Array();
      var currentItem = parseInt(self.player.currentSrc().split("/")[6]);
      console.log("Src currentItem", currentItem);

      for (var i = 0; i < serverData.length; i++) {
        if (self.playlistName == serverData[i].playlistName &&
            currentItem == serverData[i].videoId) {
          frameLabel.push.apply(frameLabel,
            JSON.parse(serverData[i].frameLabel)["label"]);
          objectLabel.push.apply(objectLabel,
            JSON.parse(serverData[i].objectLabel)["label"]);
          bboxes.push.apply(bboxes,
            JSON.parse(serverData[i].bboxes)["label"]);
          console.log("Frame label:", frameLabel);
          console.log("Object label:", objectLabel);
          console.log("Bounding boxes:", bboxes);

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
        initBoxes: bboxes
      });

      self.initLabels();
  }

  initLabels() {
    var self = this;
    var initFrameLabels = self.state.initFrameLabels;
    var initObjectLabels = self.state.initObjectLabels;
    var initBoxes = self.state.initBoxes;

    for (var i = 0; i < initFrameLabels.length; i++) {
      self.refs["label"+i].setData(initFrameLabels[i]);
      console.log("Frame labels:", self.refs["label"+i]);
    }

    var offset = initFrameLabels.length;
    for (var i = 0; i < initObjectLabels.length; i++) {
      var index = offset + i;
      self.refs["label"+index].setData(initObjectLabels[i]);
      self.refs["box"+index].setData(initBoxes[i]);
      console.log("Object labels:", self.refs["label"+index]);
      console.log("Bounding box:", self.refs["box"+index]);
    }
  }

  handleSaveModalCancel() {
    var self = this;

    self.setState({
      isSaveModalOpen: false
    });
    // Need to subtract self.start to get correct index in playlist
    self.player.playlist.currentItem(self.state.currentItem - self.start);
  }

  handleSaveModalOK() {
    var self = this;
    var currentItem = parseInt(self.player.currentSrc().split("/")[6]);

    self.setState({
      currentFrame: 0,
      currentItem: currentItem,
      isSaveModalOpen: false,
      isPlaying: false,
      isSaved: true
    });

    this.currentKey = 0;
    self.currentLabels = [];

    console.log("currentItem: ", currentItem);

    // Not saved but still want to go to the next video
    self.getVideoInfo();
  }

  handleInstructionsModalCancel() {
    var self = this;

    self.setState({
      isInstructionsModalOpen: false
    });
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
    var frameData = Array();
    var objectData = Array();
    var bboxData = Array();

    for (var i = 0; i < self.state.labelInfos.length; i++) {
      var labels = self.refs["label"+i].getData();
      var label = labels.labels;
      // Remove invalid labels
      for (var j = 0; j < label.length; j++) {
        if (label[j][0] == -1 || label[j][1] == -1) {
          label.splice(j, 1);
        }
      }
      console.log("Save data:", labels);

      if (self.state.labelInfos[i]["isFrameLabel"]) {
        frameData.push(labels);
      } else {
        var b = self.refs["box"+i].getData();
        objectData.push(labels);
        bboxData.push(b);
      }
    }

    // Send data to server
    var frameLabel = {label: frameData};
    var objectLabel = {label: objectData};
    var bboxes = {label: bboxData};
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
        objectLabel: JSON.stringify(objectLabel),
        bboxes: JSON.stringify(bboxes)
      })
    }).then(function(response) {
        self.getVideoInfo();
        return response.text(); })
      .then(data => console.log(data))
      .catch(err => console.error(this.props.url, err.toString()));

    self.setState({
      isSaved: true
    });
  }

  handleIsSaved(isSaved) {
    var self = this;

    self.setState({
      isSaved: isSaved
    });
  }

  handleIsFocus(isFocus) {
    this.isFocus = isFocus;
  }

  handleSetCurrentFrame(currentFrame) {
    var self = this;

    self.player.currentTime(currentFrame/FPS);
  }

  handleObjTextChange(event) {
    var self = this;
    var text = event.target.value;
    console.log("Text value", text);

    self.setState({
      objTextVal: text
    });
  }

  handleAddObjectSelectOptions() {
    var self = this;
    var objectSelectOptions = self.state.objectSelectOptions;
    var textVal = self.state.objTextVal;

    var flag = false;
    var options = objectSelectOptions[0].options;
    for (var i = 0; i < options.length; i++) {
      if (options[i].label === textVal) {
        flag = true;
        console.log("Object class already exist!");
        break;
      }
    }

    if (!flag) {
      objectSelectOptions[0].options.push({
        label: textVal,
        value: textVal
      });
    }
    console.log("Obj Menu:", objectSelectOptions);

    self.saveOptionInfo(self.state.frameSelectOptions, objectSelectOptions);
    self.setState({
      objectSelectOptions: objectSelectOptions
    });
  }

  handleObjectSelect(select) {
    var self = this;
    console.log("selected value", select.value);

    self.setState({
      objectSelect: select
    });
  }

  handleRemoveObjectSelectOptions() {
    var self = this;
    var objectSelectOptions = self.state.objectSelectOptions;
    var options = objectSelectOptions[0].options;
    var textVal = self.state.objectSelect.label;

    for (var i = 0; i < options.length; i++) {
       if (options[i].value === textVal) {
          options.splice(i, 1);
          break;
       }
    }
    console.log("Obj menu after remove:", objectSelectOptions);

    self.saveOptionInfo(self.state.frameSelectOptions, objectSelectOptions);
    self.setState({
      objectSelectOptions: objectSelectOptions,
      objectSelect: null
    });
  }

  handleFrameCatChange(event) {
    var self = this;
    var text = event.target.value;
    console.log("New Cat value", text);

    self.setState({
      frameCatVal: text
    });
  }

  handleFrameClassChange(event) {
    var self = this;
    var text = event.target.value;
    console.log("New Class value", text);

    self.setState({
      frameClassVal: text
    });
  }

  handleAddFrameCategory() {
    var self = this;
    var frameSelectOptions = self.state.frameSelectOptions;
    var textVal = self.state.frameCatVal;

    var flag = false;
    for (var i = 0; i < frameSelectOptions.length; i++) {
      if (frameSelectOptions[i].label === textVal) {
        flag = true;
        console.log("Frame category already exist!");
        break;
      }
    }

    if (!flag) {
      frameSelectOptions.push({
        label: textVal,
        options: []
      });
    }
    console.log("Frame Menu:", frameSelectOptions);

    self.saveOptionInfo(frameSelectOptions, self.state.objectSelectOptions);

    var categories = self.getCategories(frameSelectOptions);
    self.setState({
      frameSelectOptions: frameSelectOptions,
      categories: categories
    });
  }

  handleAddFrameClass() {
    var self = this;
    var frameSelectOptions = self.state.frameSelectOptions;
    var category = self.state.frameCategoryAdd.value;
    var textVal = self.state.frameClassVal;

    console.log("New category:", category);

    for (var i = 0; i < frameSelectOptions.length; i++) {
      if (frameSelectOptions[i].label === category) {
        var options = frameSelectOptions[i].options;
        var flag = false;
        for (var j = 0; j < options.length; j++) {
          if (options[j].label === textVal) {
            flag = true;
            console.log("Frame class already exist!");
            break;
          }
        }
        if (!flag) {
          frameSelectOptions[i].options.push({
            label: textVal,
            value: category + " - " + textVal
          });
        }
        break;
       }
    }
    console.log("Frame Menu:", frameSelectOptions);
    self.saveOptionInfo(frameSelectOptions, self.state.objectSelectOptions);

    self.setState({
      frameSelectOptions: frameSelectOptions
    });
  }

  handleRemoveFrameClass() {
    var self = this;
    var frameSelectOptions = self.state.frameSelectOptions;
    var category = self.state.frameCategoryRemove;
    var frameClass = self.state.frameSelect.label;

    for (var i = 0; i < frameSelectOptions.length; i++) {
       if (frameSelectOptions[i].label === category) {
          var options = frameSelectOptions[i].options;
          for (var j = 0; j < options.length; j++) {
            if (options[j].label === frameClass) {
              options.splice(j, 1);
              break;
            }
          }
          if (options.length == 0) {
            frameSelectOptions.splice(i, 1);
            break;
          }
       }
    }
    console.log("Frame menu after remove:", frameSelectOptions);
    self.saveOptionInfo(frameSelectOptions, self.state.objectSelectOptions);

    var categories = self.getCategories(frameSelectOptions);
    self.setState({
      frameSelectOptions: frameSelectOptions,
      frameSelect: null,
      frameCategoryRemove: null,
      frameCategoryAdd: null,
      frameClassVal: "",
      categories: categories
    });
  }

  handleChangePlaybackRate(arg0, arg1, arg2) {
    var self = this;
    var playbackRate = arg2[0];

    self.setState({
      playbackRate: playbackRate
    });
    self.player.playbackRate(playbackRate);
  }

  handleShowAdvanced() {
    var self = this;

    self.setState({
      showAdvanced: !self.state.showAdvanced
    });
  }

  handleFrameSelectRemove(select) {
    var self = this;
    console.log("selected value", select);

    self.setState({
      frameSelect: select,
      frameCategoryRemove: select.value.split(" - ")[0]
    });
  }

  handleFrameSelectAdd(select) {
    var self = this;
    console.log("selected value", select);

    self.setState({
      frameCategoryAdd: select
    });
  }

  getCategories(frameSelectOptions) {
    var self = this;
    var categories = [{options: []}];

    for (var i = 0; i < frameSelectOptions.length; i++) {
      var category = frameSelectOptions[i].label;
      categories[0].options.push({label: category, value: category});
    }

    return categories;
  }

  handleOpenInstructionsModal() {
    var self = this;

    self.setState({
      isInstructionsModalOpen: true
    });
  }

  render() {
    var self = this;
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
                      closeLabel={self.handleCloseLabel} isSaved={self.handleIsSaved}
                      numFrames={self.state.numFrames}
                      isPlaying={self.state.isPlaying} selectOptions={self.state.frameSelectOptions}
                      setCurrentFrame={self.handleSetCurrentFrame}
                      isFocus={self.handleIsFocus.bind(self)}
                    />
                  );
                } else {
                  return (
                    <ObjectLabel key={labelInfo.key} id={index}
                      ref={"label"+index} currentFrame={self.state.currentFrame}
                      closeLabel={self.handleCloseLabel} isSaved={self.handleIsSaved}
                      numFrames={self.state.numFrames}
                      isPlaying={self.state.isPlaying} selectOptions={self.state.objectSelectOptions}
                      setCurrentFrame={self.handleSetCurrentFrame}
                      isFocus={self.handleIsFocus.bind(self)}
                    />
                  );
                }
              })
            }
          </div>

          <div className="videojs-wrapper col-lg-6 col-md-6 col-sm-6">
            <div className={"small-label-frame bg-gray"}>{Math.min(self.state.currentFrame, self.state.numFrames-1)+"/"+(self.state.numFrames-1)}</div>

            <Stage ref="stage" width={WIDTH*SCALING} height={HEIGHT*SCALING} className="canvas-wrapper">
              <Layer ref="layer" id="layer">
              {
                self.state.labelInfos.map(function(labelInfo, index) {
                  if (!labelInfo.isFrameLabel) {
                    return (
                      <Box key={labelInfo.key} ref={"box"+index} id={index}
                        currentFrame={self.state.currentFrame}
                        currentOption={(self.currentLabels[index])?self.currentLabels[index].option:0}
                        isSaved={self.handleIsSaved}
                        isPlaying={self.state.isPlaying}
                      />
                    );
                  }
                })
              }
              </Layer>
            </Stage>

            {
              self.currentLabels.map(function(currentLabel, index) {
                var bg;

                if (currentLabel.isFrameLabel) {
                  if (currentLabel.option == 1) {
                    numFrameLabels++;
                    return (
                      <div className={"small-label bg-danger"} key={index} style={{left: 76*(numFrameLabels-1)+"px"}}>{"Frame "+index}</div>
                    );
                  }
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

            <video id="player" className="video-js" controls autoPlay preload="auto">
              <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
            </video>

            <div className="video-control">
              <div className="playbackRate row">
                <p className="col-lg-3 col-md-3 col-sm-3">{"Speed: "+self.state.playbackRate.toFixed(2)+"x"}</p>
                <div className="playbackRateSlider col-lg-8 col-md-8 col-sm-8 col-lg-offset-1 col-md-offset-1 col-sm-offset-1">
                  <Nouislider
                    ref={"Nouislider-playback-rate"}
                    range={{min: 0, max: 3}}
                    start={[self.state.playbackRate]}
                    step={0.25}
                    margin={0.25}
                    animate={false}
                    onSlide={self.handleChangePlaybackRate}
                    pips={{
                      mode: "values",
                      values: [0, 1, 2, 3],
                      density: 8
                    }}
                  />
                </div>
              </div>

              <div className="frame-label-customize row">
                <p className="col-lg-1 col-md-1 col-sm-1">Frame</p>
                <div className="col-lg-10 col-md-10 col-sm-10 col-lg-offset-1 col-md-offset-1 col-sm-offset-1 frame-label-customize-control">
                  <div className="row">
                    <div className="input-group add-category col-lg-6 col-md-6 col-sm-6">
                      <input type="text" className="form-control" id="name" placeholder="New Category" value={self.state.frameCatVal} onChange={self.handleFrameCatChange}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                      />
                      <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={self.handleAddFrameCategory}>
                          <span className="glyphicon glyphicon-plus-sign"></span> Add Category
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="input-group add-class">
                      <Select
                        name="form-field-name" options={self.state.categories}
                        onChange={self.handleFrameSelectAdd} value={self.state.frameCategoryAdd}
                        searchable={true} clearable={false}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                        placeholder="Category"
                      />
                      <input type="text" className="form-control" id="name" placeholder="New Class" value={self.state.frameClassVal} onChange={self.handleFrameClassChange}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                      />
                      <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={self.handleAddFrameClass}>
                          <span className="glyphicon glyphicon-plus-sign"></span> Add Class
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="input-group remove-class">
                      <input type="text" className="form-control"
                        placeholder="Category" value={self.state.frameCategoryRemove?self.state.frameCategoryRemove:""} readOnly />
                      <Select
                        name="form-field-name" options={self.state.frameSelectOptions}
                        onChange={self.handleFrameSelectRemove} value={self.state.frameSelect}
                        searchable={true} clearable={false}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                        placeholder="Class"
                      />
                      <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={self.handleRemoveFrameClass}>
                          <span className="glyphicon glyphicon-minus-sign"></span> Remove Class
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="object-label-customize row">
                <p className="col-lg-1 col-md-1 col-sm-1">Object</p>
                <div className="col-lg-10 col-md-10 col-sm-10 col-lg-offset-1 col-md-offset-1 col-sm-offset-1 object-label-customize-control">
                  <div className="row">
                    <div className="input-group add-class col-lg-5 col-md-5 col-sm-5">
                      <input type="text" className="form-control" id="name" placeholder="New Class"
                        value={self.state.objTextVal} onChange={self.handleObjTextChange}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                      />
                      <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={self.handleAddObjectSelectOptions}>
                          <span className="glyphicon glyphicon-plus-sign"></span> Add Class
                        </button>
                      </span>
                    </div>
                    <div className="input-group remove-class col-lg-6 col-md-6 col-sm-6 col-lg-offset-1 col-md-offset-1 col-sm-offset-1">
                      <Select
                        name="form-field-name" options={self.state.objectSelectOptions}
                        onChange={self.handleObjectSelect} value={self.state.objectSelect}
                        searchable={true} clearable={false}
                        onFocus={self.handleIsFocus.bind(self, true)} onBlur={self.handleIsFocus.bind(self, false)}
                        placeholder="Class"
                      />
                      <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={self.handleRemoveObjectSelectOptions}>
                          <span className="glyphicon glyphicon-minus-sign"></span> Remove Class
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="options row">
                <button className="btn btn-default col-lg-offset-1 col-md-offset-1 col-sm-offset-1" onClick={self.handleOpenInstructionsModal}>
                  <span className="glyphicon glyphicon-info-sign"></span> Instructions
                </button>
                <button className="btn btn-default col-lg-offset-1 col-md-offset-1 col-sm-offset-1" onClick={self.handleShowAdvanced}>
                  <span className="glyphicon glyphicon-list-alt"></span> Advanced Information
                </button>
              </div>
            </div>
          </div>

          <ol className="vjs-playlist col-lg-2 col-md-2 col-sm-2" onClick={self.handleClickPlaylist}></ol>
        </section>

        <section className={self.state.showAdvanced?"details":"details details-hidden"}>
          <div className="bound-properties col-lg-4 col-md-4 col-sm-4"></div>
          <div className="media-properties col-lg-4 col-md-4 col-sm-4"></div>
          <div className="media-events col-lg-4 col-md-4 col-sm-4"></div>
        </section>

        <Modal isOpen={self.state.isInstructionsModalOpen} onRequestHide={self.handleInstructionsModalCancel}>
          <ModalHeader>
            <ModalClose onClick={self.handleInstructionsModalCancel}/>
            <ModalTitle>Instructions</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <ModalTitle>Hotkeys</ModalTitle>
            <p>Space: Toggle play/pause</p>
            <p>Ctrl + S: Save</p>
            <p>Left Arrow: Step backward for 5 frames</p>
            <p>Right Arrow: Step forward for 5 frames</p>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-default" onClick={self.handleInstructionsModalCancel}>
              Close
            </button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={self.state.isSaveModalOpen} onRequestHide={self.handleSaveModalCancel}>
          <ModalHeader>
            <ModalClose onClick={self.handleSaveModalCancel}/>
            <ModalTitle>Friendly Reminder</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to navigate away from this video and discard the changes?</p>
            <p>Press OK to continue, or Cancel to stay on the current page.</p>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-default" onClick={self.handleSaveModalCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={self.handleSaveModalOK}>
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
  urlLabel: "/saveLabel",
  urlOptions: "/optionInfo",
  urlSaveOptions: "/optionInfoSave"
};
