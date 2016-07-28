import React from "react";
import Nouislider from "./NouisliderWrapper.jsx";

export default class LabelInfo extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      labels: []
    };
  }

  componentDidMount() {
    var self = this;

    self.handleClick(self.props.isFrameLabels, 0);
  }

  getCurrentOption(currentFrame) {
    var self = this;

    for (var i = 0; i < self.state.labels.length; i++) {
      var label = self.state.labels[i];
      if (currentFrame >= label.startFrame && currentFrame < label.startFrame+label.length) {
        return label.option;
      }
    }
    return -1;
  }

  getLabels() {
    return this.state.labels;
  }

  getStartFrames() {
    var self = this;
    var startFrames = [];

    if (self.state.labels.length == 0) {
      startFrames.push(0);
    } else {
      for (var i = 0; i < self.state.labels.length; i++) {
        startFrames.push(self.state.labels[i].startFrame);
      }
    }

    return startFrames;
  }

  handleClick(isFrameLabels, option) {
    var self = this;

    var currentFrame = self.props.getCurrentFrame();
    self.props.notSaved();
    var labels = self.state.labels;

    if (labels.length == 0) {
      labels.push({
        startFrame: 0,
        option: option,
        length: self.props.numFrames
      });
    } else {
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].startFrame == currentFrame) { // same frame, update option
          if (i >= 1 && labels[i-1].option == option) {
            labels[i-1].length += labels[i].length
            labels.splice(i, 1);
          } else {
            labels[i].option = option;
          }
          break;
        } else if (labels[i].startFrame > currentFrame) { // insert
          if (labels[i].option == option) { // option same as next
            labels[i].length += labels[i].startFrame-currentFrame;
            labels[i-1].length -= labels[i].startFrame-currentFrame;
            labels[i].startFrame = currentFrame;
          } else if (labels[i-1].option != option) { // option same as prev
            labels[i-1].length -= labels[i].startFrame-currentFrame;
            labels.splice(i, 0, {
              startFrame: currentFrame,
              option: option,
              length: labels[i].startFrame-currentFrame
            });
          }
          break;
        } else if (i == labels.length-1) { // append
          if (labels[i].option != option) {
            labels[i].length -= self.props.numFrames-currentFrame;
            labels.push({
              startFrame: currentFrame,
              option: option,
              length: self.props.numFrames-currentFrame
            });
          }
          break;
        }
      }
    }

    self.setState({
      labels: labels
    });
  }

  handleOnChange() {
    var self = this;
    console.log("handleOnChange");

    var labels = self.state.labels;
    if (self.refs["Nouislider"] != null) {
      var starts = self.refs["Nouislider"].slider.get();
      console.log(typeof starts);
      console.log(starts);

      if (typeof starts === 'string') {
        labels[0].startFrame = 0;
        labels[0].length = self.props.numFrames;
      } else {
        for (var i = 0; i < starts.length; i++) {
          if (i == 0) {
            labels[i].startFrame = 0;
          } else {
            labels[i].startFrame = parseInt(starts[i]);
          }
          if (i == starts.length-1) {
            labels[i].length = self.props.numFrames-parseInt(starts[i]);
          } else if (i == 0) {
            labels[i].length = parseInt(starts[i+1]);
          } else {
            labels[i].length = parseInt(starts[i+1])-parseInt(starts[i]);
          }
        }
      }
    }

    self.setState({
      labels: labels
    });
  }

  render() {
    var self = this;
    var startFrames = self.getStartFrames();

    return (
      <div className={"label-info "+(self.props.isFrameLabels?"frame-label-info":"object-label-info")}>
        <button type="button" className="close" aria-label="Close" onClick={self.props.closeLabelInfo.bind(self, self.props.id)}>
          <span aria-hidden="true">&times;</span>
        </button>
        <p>{(self.props.isFrameLabels?"Frame ":"Object ")+self.props.id}</p>

        {(() => {
          if (self.props.isFrameLabels) {
            return (
              <div className="btn-group" data-toggle="buttons">
                <label className="btn btn-success col-lg-6 col-md-6 col-sm-6 active" onClick={self.handleClick.bind(self, true, 1)}>
                  <input type="radio" name="options" id="option1" autoComplete="off" /> Start
                </label>
                <label className="btn btn-info col-lg-6 col-md-6 col-sm-6" onClick={self.handleClick.bind(self, true, 0)}>
                  <input type="radio" name="options" id="option2" autoComplete="off" /> End
                </label>
              </div>
            );
          } else {
            return (
              <div className="btn-group" data-toggle="buttons">
                <label className="btn btn-success col-lg-4 col-md-4 col-sm-4 active" onClick={self.handleClick.bind(self, false, 0)}>
                  <input type="radio" name="options" id="option1" autoComplete="off" /> Visible
                </label>
                <label className="btn btn-info col-lg-4 col-md-4 col-sm-4" onClick={self.handleClick.bind(self, false, 1)}>
                  <input type="radio" name="options" id="option2" autoComplete="off" /> Out of frame
                </label>
                <label className="btn btn-danger col-lg-4 col-md-4 col-sm-4" onClick={self.handleClick.bind(self, false, 2)}>
                  <input type="radio" name="options" id="option3" autoComplete="off" /> Occluded
                </label>
              </div>
            );
          }
        })()}

        <div className="label-slider">
          <Nouislider
            ref={"Nouislider"}
            range={{min: 0, max: self.props.numFrames}}
            step={1}
            start={startFrames}
            animate={false}
            onChange={self.handleOnChange.bind(this)}
            tooltips
          />
          {
            self.state.labels.map(function(label, index) {
              var start = 100*label.startFrame/self.props.numFrames;
              var length = 100*label.length/self.props.numFrames;

              var bg;
              switch (label.option) {
                case 0:
                  bg = "slider-success";
                  break;
                case 1:
                  bg = "slider-info";
                  break;
                case 2:
                  bg = "slider-danger";
                  break;
              }

              if (index == 0) {
                bg += " slider-left"
              }
              if (index == self.state.labels.length-1) {
                bg += " slider-right"
              }

              return (
                <div className={"slider-connect "+bg} key={index} style={{left: start+"%", width: length+"%"}}></div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

LabelInfo.propTypes = {
  isFrameLabels: React.PropTypes.bool.isRequired, // true: frame, false: object
  id: React.PropTypes.number.isRequired,
  numFrames: React.PropTypes.number.isRequired
};

LabelInfo.defaultProps = {
  isFrameLabels: true
};
