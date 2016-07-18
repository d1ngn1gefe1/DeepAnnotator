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

  render() {
    var self = this;

    return (
      <div className="annotator-content container">
        <AnnotatorNavigation />
        <div className="row">
          <div>
            <h2>{self.playlistName}</h2>
            <h3>{"video "+self.start+" - "+(self.end-1)}</h3>
            <hr className="star-primary"></hr>
            <Video playlistName={self.playlistName} start={self.start} end={self.end}/>
          </div>
        </div>
      </div>
    );
  }
}
