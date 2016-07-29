import React from "react";
import Nouislider from "./NouisliderWrapper.jsx";

export default class FrameLabel extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      /*
        label = [startFrame, endFrame]
        endFrame = -1 when it is not ended
      */
      labels: [],
      hasStarted: false
    };
  }

  componentDidMount() {
    this.handleClick();
  }

  getCurrentOption(currentFrame) {
    var self = this;

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];
      if (currentFrame >= label[0] && currentFrame < label[1]) {
        return 1;
      }
    }

    return 0; // empty
  }

  getLabels() {
    return this.state.labels;
  }

  mergeIntervals(intervals) {
    // Test if the given set has at least one interval
    if (intervals.length <= 1)
      return;

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

  handleClick() {
    var self = this;
    var currentFrame = self.props.currentFrame;
    var labels = self.state.labels;

    if (self.state.hasStarted) {
      for (var i = 0; i < labels.length; i++) {
        if (labels[i][1] == -1) {
          if (currentFrame > labels[i][0]) {
            labels[i][1] = currentFrame;
            labels = self.mergeIntervals(labels);
          } else if (currentFrame < labels[i][0]) {
            labels[i][1] = labels[i][0];
            labels[i][1] = currentFrame;
          } else {
            labels.splice(i, 1); // remove interval of length 0
          }
          break;
        }
      }
    } else {
      labels.push([currentFrame, -1]);
    }

    self.setState({
      labels: labels,
      hasStarted: !hasStarted
    });
    self.props.notSaved();
  }

  // disable slider when hasStarted == true
  handleOnChange() {
    var self = this;

    if (self.refs["Nouislider"] === null) {
      return
    }

    var labels = self.state.labels;
    var handles = self.refs["Nouislider"].slider.get();

    for (var i = 0; i < labels.length; i++) {
      labels[i][0] = handles[2*i];
      labels[i][1] = handles[2*i+1];
    }
    labels = mergeIntervals(labels);

    self.setState({
      labels: labels
    });
    self.props.notSaved();
  }

  getHandles() {
    var self = this;
    var handles = [];

    for (var i = 0; i < self.state.labels.length; i++) {
      handles.push(self.state.labels[i][0]);
      handles.push(self.state.labels[i][1]);
    }

    return handles;
  }

  getIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];

      if (label[1] == -1) {
        continue;
      }

      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0])/self.props.numFrames;

      intervals.push([start, length]);
    }

    return intervals;
  }

  render() {
    console.log("FrameLabel render");
    var self = this;
    var handles = self.getHandles();
    var intervals = self.getIntervals();

    return (
      <div className={"label-info frame-label-info"}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabelInfo.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>
        <p>{"Frame "+self.props.id}</p>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-success col-lg-6 col-md-6 col-sm-6"+(hasStarted?" disabled":"")} onClick={self.handleClick.bind(self)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Start
          </label>
          <label className={"btn btn-gray col-lg-6 col-md-6 col-sm-6"+(hasStarted?"":" disabled")} onClick={self.handleClick.bind(self)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> End
          </label>
        </div>

        <div className="label-slider">
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames}}
            step={1}
            margin={1}
            start={handles}
            animate={false}
            onChange={self.handleOnChange.bind(this)}
            disabled={hasStarted}
            tooltips
          />
          {
            self.state.intervals.map(function(interval, index) {
              var bg = " slider-success";

              if (index == 0 && interval[0] < 4) {
                bg += " slider-left"
              }
              if (index == self.state.labels.length-1 && interval[0]+interval[1] >= self.props.numFrames-4) {
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
  numFrames: React.PropTypes.number.isRequired
};

FrameLabel.defaultProps = {
};