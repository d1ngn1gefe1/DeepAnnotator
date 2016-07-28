import React from "react";

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

    console.log(labels);

    self.setState({
      labels: labels
    });
  }

  render() {
    var self = this;

    var sum = 0;
    var percentage = 0;

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

          <div className="progress">
          {
            self.state.labels.map(function (label, indexLabel) {
              if (indexLabel == self.state.labels.length-1) {
                percentage = 100-sum;
              } else {
                percentage = Math.round(100*label.length/self.props.numFrames);
                sum += percentage;
              }
              var color;
              switch (label.option) {
                case 0:
                  color = "progress-bar-success";
                  break;
                case 1:
                  color = "progress-bar-info";
                  break;
                case 2:
                  color = "progress-bar-danger";
                  break;
                default:
                  break;
              }
              return (
                <div className={"progress-bar progress-bar-striped "+color} role="progressbar" key={indexLabel} style={{width: percentage+"%"}}>
                  <span className="sr-only">ABCDEFG</span>
                </div>
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
