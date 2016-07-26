import React from "react";

export default class LabelInfo extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      name: "frame label 1"
    };
  }

  componentDidMount() {
    this.props.updateOption(this.props.id, 0); // default
  }

  handleClick(i) {
    var self = this;
    self.props.updateOption(self.props.id, i);
  }

  render() {
    var self = this;

    if (self.props.isFrameLabels) {
      // three cases: visible, outside of view frame, occluded or obstructed
      return (
        <div className="label-info frame-label-info">
          <h5>Frame</h5>
          <div className="btn-group" data-toggle="buttons">
            <label className="btn btn-primary col-lg-4 col-md-4 col-sm-4 active" onClick={self.handleClick.bind(self, 0)}>
              <input type="radio" name="options" id="option1" autoComplete="off" /> Visible
            </label>
            <label className="btn btn-primary col-lg-4 col-md-4 col-sm-4" onClick={self.handleClick.bind(self, 1)}>
              <input type="radio" name="options" id="option2" autoComplete="off" /> Out of frame
            </label>
            <label className="btn btn-primary col-lg-4 col-md-4 col-sm-4" onClick={self.handleClick.bind(self, 2)}>
              <input type="radio" name="options" id="option3" autoComplete="off" /> Occluded
            </label>
          </div>
        </div>
      );
    } else {
      return (
        <div className="label-info object-label-info">
          <h5>Object</h5>
        </div>
      );
    }
  }
}

LabelInfo.propTypes = {
  isFrameLabels: React.PropTypes.bool.isRequired, // true: frame, false: object
  id: React.PropTypes.number.isRequired
};

LabelInfo.defaultProps = {
  isFrameLabels: true
};
