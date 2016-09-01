import React from "react";
import Nouislider from "./slider/NouisliderWrapper.jsx";

import Select from "react-select";
import "react-select/dist/react-select.css";

export default class ObjectLabel extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      /*
        objectLabels is a list of label = [startFrame, endFrame, option]
        actionLabels is a list of label = [startFrame, endFrame]
      */
      objectLabels: [],
      actionLabels: [],
      objectSelect: null,
      actionSelects: [],
      hasStarted: false
    };

    this.handleObjectSelect = this.handleObjectSelect.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleObjectChange = this.handleObjectChange.bind(this);
    this.handleActionChange = this.handleActionChange.bind(this);

    this.actionSelectOptions = [
      { value: "one", label: "1. One" },
      { value: "two", label: "2. Two" },
      { value: "asdfsadfasdffff", label: "3. fffffffffffffffffffffff" }
    ];
  }

  componentDidMount() {
    var self = this;

    self.handleObjectClick(0);
  }

  componentDidUpdate() {
    var self = this;

    if (self.state.actionLabels.length == 0) {
      document.getElementById("action-label-slider"+self.props.id).getElementsByClassName("noUi-origin")[0].className += " handle-invisible";
    }
  }

  getCurrentOption() {
    var self = this;

    for (var i = 0; i < self.state.objectLabels.length; i++) {
      var label = self.state.objectLabels[i];
      if ((self.props.currentFrame >= label[0] && self.props.currentFrame <= label[1]) || (i == self.state.objectLabels.length-1 && self.props.currentFrame == self.props.numFrames)) {
        return label[2];
      }
    }

    return -1; // error
  }

  getData() {
    var data = {}
    data["objectLabels"] = this.state.objectLabels;
    data["objectSelect"] = this.state.objectSelect;
    data["actionLabels"] = this.state.actionLabels;
    data["actionSelects"] = this.state.actionSelects;
    return data;
  }

  setData(data) {
    this.setState({
      objectLabels: data["objectLabels"] == null ? [] : data["objectLabels"],
      objectSelect: data["objectSelect"],
      actionLabels: data["actionLabels"] == null ? [] : data["actionLabels"],
      actionSelects: data["actionSelects"] == null ? [] : data["actionSelects"]
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

  handleObjectClick(option) {
    var self = this;

    var currentFrame = self.props.currentFrame;
    var objectLabels = self.state.objectLabels;

    if (objectLabels.length == 0) {
      objectLabels.push([0, self.props.currentFrame-1, 1])
      objectLabels.push([self.props.currentFrame, self.props.numFrames-1, option])
    } else {
      for (var i = 0; i < objectLabels.length; i++) {
        if (objectLabels[i][0] == currentFrame) { // same frame, update option
          if (i >= 1 && objectLabels[i-1][2] == option) {
            objectLabels[i-1][1] = objectLabels[i][1];
            objectLabels.splice(i, 1);
          } else if (i <= objectLabels.length-2 && objectLabels[i+1][2] == option) {
            objectLabels[i][1] = objectLabels[i+1][1];
            objectLabels[i][2] = option;
            objectLabels.splice(i+1, 1);
          } else {
            objectLabels[i][2] = option;
          }
          break;
        } else if (objectLabels[i][0] > currentFrame) { // insert
          if (objectLabels[i][2] == option) {
            objectLabels[i][0] = currentFrame;
            objectLabels[i-1][1] = currentFrame-1;
          } else if (objectLabels[i-1][2] != option) {
            objectLabels.splice(i, 0, [currentFrame, objectLabels[i-1][1], option]);
            objectLabels[i-1][1] = currentFrame-1;
          }
          break;
        } else if (i == objectLabels.length-1) { // append
          if (objectLabels[i][2] != option) {
            objectLabels[i][1] = currentFrame-1;
            objectLabels.push([currentFrame, self.props.numFrames-1, option]);
          }
          break;
        }
      }
    }

    self.setState({
      objectLabels: objectLabels
    });
    self.props.isSaved(false);
  }

  handleActionClick(isStartButton) {
    var self = this;

    if (self.state.hasStarted == isStartButton) {
      return;
    }

    var currentFrame = self.props.currentFrame;
    var actionLabels = self.state.actionLabels;

    if (self.state.hasStarted) {
      for (var i = 0; i < actionLabels.length; i++) {
        if (actionLabels[i][1] == -1) {
          if (currentFrame > actionLabels[i][0]) {
            actionLabels[i][1] = currentFrame;
            actionLabels = self.mergeIntervals(actionLabels);
          } else if (currentFrame < actionLabels[i][0]) {
            actionLabels[i][1] = actionLabels[i][0];
            actionLabels[i][0] = currentFrame;
            actionLabels = self.mergeIntervals(actionLabels);
          } else {
            actionLabels.splice(i, 1); // remove interval of length 0
          }
          break;
        }
      }
    } else {
      if (actionLabels.length == 0 || currentFrame >= actionLabels[actionLabels.length-1][0]) {
        actionLabels.push([currentFrame, -1]);
      } else {
        for (var i = 0; i < actionLabels.length; i++) {
          if (actionLabels[i][0] > currentFrame) {
            actionLabels.splice(i, 0, [currentFrame, -1]);
          }
        }
      }
    }

    self.setState({
      actionLabels: actionLabels,
      hasStarted: !self.state.hasStarted
    });
    self.props.isSaved(false);
  }

  handleObjectChange(handles, index) {
    var self = this;
    var objectLabels = self.state.objectLabels;

    if (index == 0) {
      self.setState({
        objectLabels: objectLabels
      });
      return;
    }

    var value = parseInt(handles[index]);
    objectLabels[index][0] = value;
    objectLabels[index-1][1] = value-1;

    self.setState({
      objectLabels: objectLabels
    });
    self.props.setCurrentFrame(value);
    self.props.isSaved(false);
  }

  handleActionChange(handles, index) {
    var self = this;
    var actionLabels = self.state.actionLabels;

    var value = parseInt(handles[index]);
    actionLabels[Math.floor(index/2)][index%2] = value;

    self.setState({
      actionLabels: actionLabels
    });
    self.props.setCurrentFrame(value);
    self.props.isSaved(false);
  }

  getObjectHandles() {
    var self = this;
    if (self.state.objectLabels.length == 0) {
      return [0];
    }

    var handles = [];
    for (var i = 0; i < self.state.objectLabels.length; i++) {
      handles.push(self.state.objectLabels[i][0]);
    }

    return handles;
  }

  getActionHandles() {
    var self = this;
    if (self.state.actionLabels.length == 0) {
      return [0];
    }

    var handles = [];
    for (var i = 0; i < self.state.actionLabels.length; i++) {
      handles.push(self.state.actionLabels[i][0]);
      if (self.state.actionLabels[i][1] != -1) {
        handles.push(self.state.actionLabels[i][1]);
      }
    }

    return handles;
  }

  getObjectIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.objectLabels.length; i++) {
      var label = self.state.objectLabels[i];
      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0]+1)/self.props.numFrames;
      intervals.push([start, length, label[2]]);
    }

    return intervals;
  }

  getActionIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.actionLabels.length; i++) {
      var label = self.state.actionLabels[i];

      if (label[1] == -1) {
        continue;
      }

      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0]+1)/self.props.numFrames;

      intervals.push([start, length]);
    }

    return intervals;
  }

  handleObjectSelect(objectSelect) {
    var self = this;
    console.log("selected value", objectSelect);

    self.setState({
      objectSelect: objectSelect
    });
    self.props.isSaved(false);
  }

  handleActionSelect(index, actionSelect) {
    var self = this;
    console.log("selected value", actionSelect, index);

    var actionSelects = self.state.actionSelects;
    actionSelects[index] = actionSelect;

    self.setState({
      actionSelects: actionSelects
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
    var objectHandles = self.getObjectHandles();
    var actionHandles = self.getActionHandles();
    var objectIntervals = self.getObjectIntervals();
    var actionIntervals = self.getActionIntervals();

    return (
      <div className={"label-info object-label-info"}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabel.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="label-header row">
          <p className="label-text col-lg-3 col-md-3 col-sm-3">{"Object "+self.props.id}</p>
          <Select className="label-select col-lg-8 col-md-8 col-sm-8 col-lg-offset-1 col-md-offset-1 col-sm-offset-1"
            name="form-field-name" options={self.props.objectSelectOptions}
            onChange={self.handleObjectSelect} value={self.state.objectSelect}
            searchable={true} clearable={false} autoBlur={true}
            onFocus={self.handleFocus} onBlur={self.handleBlur}
          />
        </div>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-success col-lg-4 col-md-4 col-sm-4"} onClick={self.handleObjectClick.bind(self, 0)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Visible
          </label>
          <label className={"btn btn-info col-lg-4 col-md-4 col-sm-4"} onClick={self.handleObjectClick.bind(self, 1)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> Out of frame
          </label>
          <label className={"btn btn-danger col-lg-4 col-md-4 col-sm-4"} onClick={self.handleObjectClick.bind(self, 2)}>
            <input type="radio" name="options" id="option3" autoComplete="off" /> Occluded
          </label>
        </div>

        <div className="label-slider">
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames==0?1:self.props.numFrames-1}}
            step={1}
            margin={1}
            start={objectHandles}
            animate={false}
            onChange={self.handleObjectChange}
            disabled={self.props.isPlaying}
            tooltips
          />
          {
            objectIntervals.map(function(interval, index) {
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
              if (index == self.state.objectLabels.length-1) {
                bg += " slider-right"
              }

              return (
                <div className={"slider-connect"+bg} key={index} style={{left: interval[0]+"%", width: interval[1]+"%"}}></div>
              );
            })
          }
        </div>

        <div className="label-subheader row">
          <p className="label-text col-lg-12 col-md-12 col-sm-12">{"Action"}</p>
        </div>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-danger col-lg-6 col-md-6 col-sm-6"+(self.state.hasStarted?" disabled":"")} onClick={self.handleActionClick.bind(self, true)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Start
          </label>
          <label className={"btn btn-gray col-lg-6 col-md-6 col-sm-6"+(self.state.hasStarted?"":" disabled")} onClick={self.handleActionClick.bind(self, false)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> End
          </label>
        </div>

        <div className="label-slider" id={"action-label-slider"+self.props.id}>
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames==0?1:self.props.numFrames-1}}
            step={1}
            margin={1}
            start={actionHandles}
            animate={false}
            onChange={self.handleActionChange}
            disabled={self.state.hasStarted || self.props.isPlaying}
            tooltips
          />
          {
            actionIntervals.map(function(interval, index) {
              var bg = " slider-danger";

              if (index == 0) {
                bg += " slider-left"
              }
              if (index == self.state.actionLabels.length-1) {
                bg += " slider-right"
              }

              return (
                <div className={"slider-connect"+bg} key={index} style={{left: interval[0]+"%", width: interval[1]+"%"}}>
                  <Select className="label-action-select"
                    name="form-field-name" options={self.actionSelectOptions}
                    onChange={self.handleActionSelect.bind(self, index)} value={self.state.actionSelects[index]}
                    searchable={false} clearable={false}
                    onFocus={self.handleFocus} onBlur={self.handleBlur}
                    placeholder="+"
                  />
                </div>
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
