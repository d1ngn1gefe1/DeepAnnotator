import React from "react";
import Nouislider from "./NouisliderWrapper.jsx";

export default class ObjectLabel extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      /*
        label = [startFrame, endFrame, option]
      */
      labels: [],
      activeButton: -1
    };
  }

  componentDidMount() {
    this.handleClick(0);
  }

  getCurrentOption(currentFrame) {
    var self = this;

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];
      if (currentFrame >= label[0] && currentFrame < label[1]) {
        return label[2];
      }
    }

    return -1; // error
  }

  getLabels() {
    return this.state.labels;
  }

  handleClick(option) {
    var self = this;
    var currentFrame = self.props.currentFrame;
    var labels = self.state.labels;

    if (labels.length == 0) {
      labels.push([0, self.props.numFrames-1, option])
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
            labels[i].option = option;
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
          if (labels[i].option != option) {
            labels[i][1] = currentFrame-1;
            labels.push([currentFrame, self.props.numFrames, option]);
          }
          break;
        }
      }
    }

    self.setState({
      labels: labels,
      activeButton: option
    });
    self.props.notSaved();
  }

  handleOnChange() {
    var self = this;

    if (self.refs["Nouislider"] === null) {
      return
    }

    var labels = self.state.labels;
    var handles = self.refs["Nouislider"].slider.get();

    if (typeof handles === 'string') {
      labels[0][0] = 0;
      labels[0][1] = self.props.numFrames-1;
    } else {
      // labels.length >= 2
      for (var i = 0; i < labels.length; i++) {
        if (i == 0) {
          labels[0][0] = 0;
          label[0][1] = handles[1]-1;
        } else if (i == labels.length-1) {
          labels[i][0] = handles[i];
          labels[i][1] = self.props.numFrames-handles[i];
        } else {
          labels[i][0] = handles[i];
          labels[i][1] = handles[i+1]-1;
        }
      }
    }

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
    }

    return handles;
  }

  getIntervals() {
    var self = this;
    var intervals = [];

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];

      var start = 100*label[0]/self.props.numFrames;
      var length = 100*(label[1]-label[0])/self.props.numFrames;

      intervals.push([start, length, label[2]]);
    }

    return intervals;
  }

  render() {
    console.log("ObjectLabel render");
    var self = this;
    var handles = self.getHandles();
    var intervals = self.getIntervals();

    return (
      <div className={"label-info object-label-info"}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabel.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>
        <p>{"Object "+self.props.id}</p>

        <div className="btn-group" data-toggle="buttons">
          <label className={"btn btn-success col-lg-4 col-md-4 col-sm-4"+(activeButton==0?" active disabled":"")} onClick={self.handleClick.bind(self, 0)}>
            <input type="radio" name="options" id="option1" autoComplete="off" /> Visible
          </label>
          <label className={"btn btn-info col-lg-4 col-md-4 col-sm-4"+(activeButton==1?" active disabled":"")} onClick={self.handleClick.bind(self, 1)}>
            <input type="radio" name="options" id="option2" autoComplete="off" /> Out of frame
          </label>
          <label className={"btn btn-danger col-lg-4 col-md-4 col-sm-4"+(activeButton==2?" active disabled":"")} onClick={self.handleClick.bind(self, 2)}>
            <input type="radio" name="options" id="option3" autoComplete="off" /> Occluded
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
            tooltips
          />
          {
            self.state.intervals.map(function(interval, index) {
              var bg;

              if (interval[2] == 0) {
                bg = " slider-success";
              } else if (interval[2] == 1) {
                bg = " slider-info";
              } else if (interval[2] == 2) {
                bg = " slider-danger";
              }

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

ObjectLabel.propTypes = {
  id: React.PropTypes.number.isRequired,
  numFrames: React.PropTypes.number.isRequired,
  currentFrame: React.PropTypes.number.isRequired
};

ObjectLabel.defaultProps = {
};
