import React from "react";
import vjs from 'video.js';

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
      <video id={"video"+self.props.start} className="video-js vjs-default-skin" controls preload="auto" width="640" height="480" poster={thumbnail} data-setup="{}">
        <source src={videoPath} type="video/mp4" />
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
    );
  }
}

VideoAnnotator.propTypes = {
  playlistName: React.PropTypes.string.isRequired,
  start: React.PropTypes.number.isRequired,
  end: React.PropTypes.number.isRequired
};
