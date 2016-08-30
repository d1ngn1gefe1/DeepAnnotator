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
    self.playlistName = "10.0.1.71";
    for (var i = 0; i < 1; i++) {
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
      autoplay: false
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
