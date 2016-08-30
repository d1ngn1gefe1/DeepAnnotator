import 'es5-shim';
import 'es6-shim';
import 'es7-shim';
import React from "react";
import videojs from "video.js";
import document from 'global/document';
import 'videojs-contrib-hls';
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

    const player = window.player = videojs("player", {
      control: true,
      preload: "auto",
      autoplay: false
    });

    player.playlist(playlist);
    player.playlistUi();

    player.on('loadstart', function() {
      console.log(player.playlist.currentItem());
    });
  }

  render() {
    return (
      <section className="main-preview-player">
        <video id="preview-player" class="video-js vjs-fluid" controls preload="auto">
          <p className="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
        </video>

        <div className="playlist-container  preview-player-dimensions vjs-fluid">
          <ol className="vjs-playlist"></ol>
        </div>
      </section>
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
