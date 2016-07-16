import React from "react";
import Video from './Video.jsx';

export default class VideoAnnotator extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
    };
  };

  componentDidMount() {
  };

  render() {
    var self = this;
    var thumbnail = "video/"+self.props.playlistName+"/"+self.props.start+"/thumbnail.jpg"
    var videoPath = "video/"+self.props.playlistName+"/"+self.props.start+"/depth.mp4"

    return (
      <Video src={videoPath} />
    );
  }
}

VideoAnnotator.propTypes = {
  playlistName: React.PropTypes.string.isRequired,
  start: React.PropTypes.number.isRequired,
  end: React.PropTypes.number.isRequired
};
