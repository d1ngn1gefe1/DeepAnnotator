import React from "react";

export default class VideoAnnotator extends React.Component {
  render() {
    return (
      <video id={"video"+this.props.videoId} className="video-js" controls preload="auto" width="640" height="480" poster={"img/video-annotator/"+this.props.thumbnail+".png"} data-setup="{}">
        <source src="video/example.mp4" type='video/mp4' />
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
    );
  }
}
