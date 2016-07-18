import React from "react";
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
    console.log(this.playlistName);
  };

  render() {
    var self = this;

    return (
      <div className="annotator-content container">
        <div className="row">
            <div className="col-lg-10 col-lg-offset-1">
              <h2>{self.playlistName}</h2>
              <h3>{"video "+self.start+" - "+self.end}</h3>
              <hr className="star-primary"></hr>

              <Video playlistName={self.playlistName} start={self.start} end={self.end}/>
            </div>
        </div>
      </div>
    );
  }
}
