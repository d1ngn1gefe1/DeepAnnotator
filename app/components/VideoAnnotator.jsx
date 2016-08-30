import React from "react";
import videojs from "video.js";
import "videojs-playlist";
import "videojs-playlist-ui";

import "video.js/dist/video-js.min.css";
import "videojs-playlist-ui/dist/videojs-playlist-ui.vertical.css";

export default class VideoAnnotator extends React.Component {
  constructor(props, defaultProps) {
    console.log("VideoAnnotator Contructor");
    super(props, defaultProps);
  }

  componentDidMount() {
    console.log("VideoAnnotator componentDidMount");
    var self = this;

    var playlist = [];
    for (var i = self.start; i < self.end; i++) {
      playlist.push({
        "sources": [{
          "src": "/static/video/"+self.playlistName+"/"+i+"/depth.mp4", "type": "video/mp4"
        }],
        "name": "Video "+i,
        "thumbnail": "/static/video/"+self.playlistName+"/"+i+"/thumbnail.jpg"
      });
    }

    self.player = videojs("player", {
      control: true,
      preload: "auto",
      autoplay: false,
      plugins: {
        framebyframe: {
          fps: FPS,
          steps: [
            { text: "-5", step: -5 },
            { text: "-1", step: -1 },
            { text: "+1", step: 1 },
            { text: "+5", step: 5 },
          ]
        }
      }
    });

    self.player.playlist(playlist);
    self.player.playlistUi();

    self.player.on('loadstart', function() {
      console.log(self.player.playlist.currentItem());
    });
  }

  render() {
    return (
      <video id="player" className="video-js" controls preload="auto" crossOrigin="anonymous">
        <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
      </video>
    );
  }
}

VideoAnnotator.propTypes = {
  description: React.PropTypes.string
};

VideoAnnotator.defaultProps = {
  url: "/videoInfo",
  urlLabel: "/saveLabel",
  urlOptions: "/optionInfo",
  urlSaveOptions: "/optionInfoSave"
};
