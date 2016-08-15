import React from "react";
import Nouislider from "./slider/NouisliderWrapper.jsx";

import Select from "react-select-plus";
import "react-select-plus/dist/react-select-plus.css";

export default class ObjectLabel extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      /*
        labels is a list of label = [startFrame, endFrame, option]
      */
      labels: [],
      select: null,
      textVal: ""
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleAddText = this.handleAddText.bind(this);
  }

  componentDidMount() {
    var self = this;

    self.handleClick(0);
  }

  getCurrentOption() {
    var self = this;

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];
      if (self.props.currentFrame >= label[0] && self.props.currentFrame <= label[1]) {
        return label[2];
      }
    }

    return -1; // error
  }

  getData() {
    var data = {}
    data["labels"] = this.state.labels;
    data["select"] = this.state.select;
    return data;
  }

  setData(data) {
    this.setState({
      labels: data["labels"],
      select: data["select"]
    });
    this.props.saved();
  }

  handleClick(option) {
    var self = this;

    var currentFrame = self.props.currentFrame;
    var labels = self.state.labels;

    if (labels.length == 0) {
      labels.push([0, self.props.currentFrame-1, 1])
      labels.push([self.props.currentFrame, self.props.numFrames-1, option])
    } else {
      for (var i = 0; i < labels.length; i++) {
        if (labels[i][0] == currentFrame) { // same frame, update option
          if (i >= 1 && labels[i-1][2] == option) {
            labels[i-1][1] = labels[i][1];
            labels.splice(i, 1);
          } else if (i <= labels.length-2 && labels[i+1][2] == option) {
            labels[i][1] = labels[i+1][1];
            labels[i][2] = option;
            labels.splice(i+1, 1);
          } else {
            labels[i][2] = option;
          }
          break;
        } else if (labels[i][0] > currentFrame) { // insert
          if (labels[i][2] == option) {
            labels[i][0] = currentFrame;
            labels[i-1][1] = currentFrame-1;
          } else if (labels[i-1][2] != option) {
            labels.splice(i, 0, [currentFrame, labels[i-1][1], option]);
            labels[i-1][1] = currentFrame-1;
          }
          break;
        } else if (i == labels.length-1) { // append
          if (labels[i][2] != option) {
            labels[i][1] = currentFrame-1;
            labels.push([currentFrame, self.props.numFrames, option]);
          }
          break;
        }
      }
    }

    self.setState({
      labels: labels
    });
    self.props.notSaved();
  }

  handleChange(handles, index) {
    var self = this;
    var labels = self.state.labels;

    if (index == 0) {
      return;
    }

    var value = parseInt(handles[index]);
    labels[index][0] = value;
    labels[index-1][1] = value-1;

    self.setState({
      labels: labels
    });
    self.props.setCurrentFrame(value);
    self.props.notSaved();
  }

  getHandles() {
    var self = this;
    if (self.state.labels.length == 0) {
      return [0];
    }

    var handles = [];
    for (var i = 0; i < self.state.labels.length; i++) {
      handles.push(self.state.labels[i][0]);
    }

    return handles;
  }

  getIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];
      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0]+1)/self.props.numFrames;
      intervals.push([start, length, label[2]]);
    }

    return intervals;
  }

  handleSelect(select) {
    var self = this;
    console.log("selected value", select);

    self.setState({
      select: select
    });
    self.props.notSaved();
  }

  handleAddText() {
    var self = this;
    var selectOptions = self.props.selectOptions;

    var textVal = self.state.textVal;
    console.log("Click", textVal);

    selectOptions[0].options.push({
      label: textVal,
      value: textVal
    });
    console.log("Menu:", selectOptions);
    self.props.updateObjSelectOptions(selectOptions);
  }

  handleTextChange(event) {
    var self = this;
    var text = event.target.value;
    console.log("text value", self.state.textVal);

    self.setState({
      textVal: text
    });
  }

  render() {
    var self = this;
    var handles = self.getHandles();
    var intervals = self.getIntervals();

    return (
      <div className={"label-info object-label-info"}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabel.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="label-header row">
          <p className="label-text col-lg-2 col-md-2 col-sm-2">{"Object "+self.props.id}</p>
          <div className="label-add-class input-group col-lg-5 col-md-5 col-sm-5">
            <input type="text" className="form-control" id="name" placeholder="New Class" value={self.state.textVal} onChange={self.handleTextChange} />
            <span className="input-group-btn">
              <button type="button" className="btn btn-default" onClick={self.handleAddText}>
                <span className="glyphicon glyphicon-plus-sign"></span> Add Class
              </button>
            </span>
          </div>
          <Select className="label-select col-lg-5 col-md-5 col-sm-5" name="form-field-name" options={self.props.selectOptions} onChange={self.handleSelect} value={self.state.select} searchable={true} clearable={true} />
        </div>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-success col-lg-4 col-md-4 col-sm-4"} onClick={self.handleClick.bind(self, 0)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Visible
          </label>
          <label className={"btn btn-info col-lg-4 col-md-4 col-sm-4"} onClick={self.handleClick.bind(self, 1)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> Out of frame
          </label>
          <label className={"btn btn-danger col-lg-4 col-md-4 col-sm-4"} onClick={self.handleClick.bind(self, 2)}>
            <input type="radio" name="options" id="option3" autoComplete="off" /> Occluded
          </label>
        </div>

        <div className="label-slider">
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames==0?1:self.props.numFrames}}
            step={1}
            margin={1}
            start={handles}
            animate={false}
            onChange={self.handleChange.bind(self)}
            disabled={self.props.isPlaying}
            tooltips
          />
          {
            intervals.map(function(interval, index) {
              var bg;

              if (interval[2] == 0) {
                bg = " slider-success";
              } else if (interval[2] == 1) {
                bg = " slider-info";
              } else if (interval[2] == 2) {
                bg = " slider-danger";
              }

              if (index == 0) {
                bg += " slider-left"
              }
              if (index == self.state.labels.length-1) {
                bg += " slider-right"
              }

              return (
                <div className={"slider-connect"+bg} key={index} style={{left: interval[0]+"%", width: interval[1]+"%"}}></div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

ObjectLabel.propTypes = {
  id: React.PropTypes.number.isRequired,
  numFrames: React.PropTypes.number.isRequired,
  isPlaying: React.PropTypes.bool.isRequired
};

ObjectLabel.defaultProps = {
};
