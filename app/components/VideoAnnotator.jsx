import React from "react";
import AnnotatorNavigation from "./AnnotatorNavigation.jsx";
import Video from './Video.jsx';

export default class VideoAnnotator extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
    };
  };

  componentWillMount() {
    this.playlistName = this.props.params.playlistName;
    var range = this.props.params.range.split("-");
    this.start = parseInt(range[0]);
    this.end = parseInt(range[1])+1; // exclusive
  };

  componentDidMount() {
    this.refs.videojs.hello();
  };

  render() {
    var self = this;

    return (
      <div className="annotator-content container-fluid">
        <AnnotatorNavigation description={self.playlistName+", video "+self.start+" - "+(self.end-1)} />
        <div className="row">
          <div className="col-lg-3 col-md-3 col-sm-3 col-sm-3 fix-height control-panel">
            <button type="button">New Frame Labels</button>
            <button type="button">New Object Labels</button>
          </div>
          <Video playlistName={self.playlistName} start={self.start} end={self.end} ref={"videojs"}/>
        </div>
      </div>
    );
  }
}
