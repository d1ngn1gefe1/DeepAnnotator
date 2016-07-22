import React from "react";

export default class LabelInfo extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      name: "frame label 1"
    };
  }

  render() {
    var self = this;

    return (
      <div className={(self.props.isFrameLabels ? "frame" : "object")+"-label-info"}>
        {(self.props.isFrameLabels ? "Frame" : "Object")}
      </div>
    );
  }
}

LabelInfo.propTypes = {
  isFrameLabels: React.PropTypes.bool.isRequired // true: frame, false: object
};

LabelInfo.defaultProps = {
  isFrameLabels: true
};
