import React from "react";

export default class LabelInfo extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      name: "frame label 1"
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    self = this;

    self.props.updateOption(self.props.id, event.target.value);
  }

  render() {
    var self = this;

    if (self.props.isFrameLabels) {
      // three cases: visible, outside of view frame, occluded or obstructed
      return (
        <div className="label-info frame-label-info">
          <h5>Frame</h5>
          <div className="radio">
            <label>
              <input type="radio" name="optradio" value={0} onChange={self.handleChange} />
              Visible
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name="optradio" value={1} onChange={self.handleChange} />
              Outside of frame
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name="optradio" value={2} onChange={self.handleChange} />
              Occluded
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
