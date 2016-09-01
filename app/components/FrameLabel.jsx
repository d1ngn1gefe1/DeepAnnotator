import React from "react";
import Nouislider from "./slider/NouisliderWrapper.jsx";

import Select from "react-select";
import "react-select/dist/react-select.css";

export default class FrameLabel extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      frameLabels: [],
      frameSelect: null,
      hasStarted: false
    };

    this.handleFrameSelect = this.handleFrameSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentDidMount() {
    this.handleClick(true);
  }

  getCurrentOption() {
    var self = this;

    for (var i = 0; i < self.state.frameLabels.length; i++) {
      var label = self.state.frameLabels[i];
      if (self.props.currentFrame >= label[0] && self.props.currentFrame <= label[1]) {
        return 1;
      }
    }

    return 0; // empty
  }

  getData() {
    var data = {}
    data["frameLabels"] = this.state.frameLabels;
    data["frameSelect"] = this.state.frameSelect;
    return data;
  }

  setData(data) {
    console.log("setdata", data["frameLabels"]);
    this.setState({
      frameLabels: data["frameLabels"] == null ? [] : data["frameLabels"],
      frameSelect: data["objeframeSelectctLabels"]
    });
    this.props.isSaved(true);
  }

  mergeIntervals(intervals) {
    // Test if the given set has at least one interval
    if (intervals.length <= 1) {
      return intervals;
    }

    // Create an empty stack of intervals
    var stack = [], last;

    // sort the intervals based on start time
    intervals.sort(function(a,b) {
      return a[0] - b[0];
    });

    // push the first interval to stack
    stack.push(intervals[0]);

    // Start from the next interval and merge if necessary
    for (var i = 1, len = intervals.length; i < len; i++) {
      // get interval from last item
      last = stack[stack.length-1];

      // if current interval is not overlapping with stack top,
      // push it to the stack
      if (last[1] <= intervals[i][0]) {
        stack.push( intervals[i]);
      }

      // Otherwise update the ending time of top if ending of current
      // interval is more
      else if (last[1] < intervals[i][1]) {
        last[1] = intervals[i][1];
        stack.pop();
        stack.push(last);
      }
    }

    return stack;
  }

  handleClick(isStartButton) {
    var self = this;

    if (self.state.hasStarted == isStartButton) {
      return;
    }

    var currentFrame = self.props.currentFrame;
    var frameLabels = self.state.frameLabels;

    if (self.state.hasStarted) {
      for (var i = 0; i < frameLabels.length; i++) {
        if (frameLabels[i][1] == -1) {
          if (currentFrame > frameLabels[i][0]) {
            frameLabels[i][1] = currentFrame;
            frameLabels = self.mergeIntervals(frameLabels);
          } else if (currentFrame < frameLabels[i][0]) {
            frameLabels[i][1] = frameLabels[i][0];
            frameLabels[i][0] = currentFrame;
            frameLabels = self.mergeIntervals(frameLabels);
          } else {
            frameLabels.splice(i, 1); // remove interval of length 0
          }
          break;
        }
      }
    } else {
      if (frameLabels.length == 0 || currentFrame >= frameLabels[frameLabels.length-1][0]) {
        frameLabels.push([currentFrame, -1]);
      } else {
        for (var i = 0; i < frameLabels.length; i++) {
          if (frameLabels[i][0] > currentFrame) {
            frameLabels.splice(i, 0, [currentFrame, -1]);
          }
        }
      }
    }

    self.setState({
      frameLabels: frameLabels,
      hasStarted: !self.state.hasStarted
    });
    self.props.isSaved(false);
  }

  handleChange(handles, index) {
    var self = this;
    var frameLabels = self.state.frameLabels;

    var value = parseInt(handles[index]);
    frameLabels[Math.floor(index/2)][index%2] = value;

    self.setState({
      frameLabels: frameLabels
    });
    self.props.setCurrentFrame(value);
    self.props.isSaved(false);
  }

  getHandles() {
    var self = this;
    if (self.state.frameLabels.length == 0) {
      return [0];
    }

    var handles = [];
    for (var i = 0; i < self.state.frameLabels.length; i++) {
      handles.push(self.state.frameLabels[i][0]);
      if (self.state.frameLabels[i][1] != -1) {
        handles.push(self.state.frameLabels[i][1]);
      }
    }

    return handles;
  }

  getIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.frameLabels.length; i++) {
      var label = self.state.frameLabels[i];

      if (label[1] == -1) {
        continue;
      }

      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0]+1)/self.props.numFrames;

      intervals.push([start, length]);
    }

    return intervals;
  }

  handleFrameSelect(frameSelect) {
    var self = this;
    console.log("selected value", frameSelect);

    self.setState({
      frameSelect: frameSelect
    });
    self.props.isSaved(false);
  }

  handleFocus() {
    this.props.isFocus(true);
  }

  handleBlur() {
    this.props.isFocus(false);
  }

  render() {
    var self = this;
    var handles = self.getHandles();
    var intervals = self.getIntervals();

    return (
      <div className={"label-info frame-label-info"}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabel.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="label-header row">
          <p className="label-text col-lg-3 col-md-3 col-sm-3">{"Frame "+self.props.id}</p>
          <Select className="label-select col-lg-8 col-md-8 col-sm-8 col-lg-offset-1 col-md-offset-1 col-sm-offset-1"
            name="form-field-name" options={self.props.frameSelectOptions}
            onChange={self.handleFrameSelect} value={self.state.frameSelect}
            searchable={true} clearable={false} autoBlur={true}
            onFocus={self.handleFocus} onBlur={self.handleBlur}
          />
        </div>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-danger col-lg-6 col-md-6 col-sm-6"+(self.state.hasStarted?" disabled":"")} onClick={self.handleClick.bind(self, true)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Start
          </label>
          <label className={"btn btn-gray col-lg-6 col-md-6 col-sm-6"+(self.state.hasStarted?"":" disabled")} onClick={self.handleClick.bind(self, false)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> End
          </label>
        </div>

        <div className="label-slider">
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames==0?1:self.props.numFrames-1}}
            step={1}
            margin={1}
            start={handles}
            animate={false}
            onChange={self.handleChange}
            disabled={self.state.hasStarted || self.props.isPlaying}
            tooltips
          />
          {
            intervals.map(function(interval, index) {
              var bg = " slider-danger";

              if (index == 0) {
                bg += " slider-left"
              }
              if (index == self.state.frameLabels.length-1) {
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

FrameLabel.propTypes = {
  id: React.PropTypes.number.isRequired,
  numFrames: React.PropTypes.number.isRequired,
  isPlaying: React.PropTypes.bool.isRequired
};

FrameLabel.defaultProps = {
};
