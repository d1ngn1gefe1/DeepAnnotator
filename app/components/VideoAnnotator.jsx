import React from "react";
import Video from './Video.jsx';
import LabelInfo from './LabelInfo.jsx';

export default class VideoAnnotator extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);

    this.state = {
      labelInfoLists: []
    };

    this.handleNewFrameLabels = this.handleNewFrameLabels.bind(this);
    this.handleNewObjectLabels = this.handleNewObjectLabels.bind(this);
  }

  componentWillMount() {
    this.playlistName = this.props.params.playlistName;
    var range = this.props.params.range.split("-");
    this.start = parseInt(range[0]);
    this.end = parseInt(range[1])+1; // exclusive
  };

  componentDidMount() {
    this.refs.videojs.hello();
    fetch('/videoInfo', {method: 'post'})
      .then(response => response)
      .then(data => console.log(data))
      .catch(err => console.error('/videoInfo', err.toString()))
  };

  handleNewFrameLabels() {
    console.log("new frame labels");
    var self = this;

    self.setState({
      labelInfoLists: self.state.labelInfoLists.concat({
        isFrameLabels: false
      })
    });
  }

  handleNewObjectLabels() {
    console.log("new object labels");
    var self = this;

    self.setState({
      labelInfoLists: self.state.labelInfoLists.concat({
        isFrameLabels: true
      })
    });
  }

  render() {
    console.log("render VideoAnnotator");
    var self = this;

    return (
      <div className="annotator-content container-fluid">
        <AnnotatorNavigation description={self.playlistName+", video "+self.start+" - "+(self.end-1)} />
        <div className="row annotator-content-main">
          <div className="col-lg-3 col-md-3 col-sm-3 col-sm-3 fix-height control-panel">
            <div className="row control-panel-add-buttons">
              <button type="button" className="btn btn-warning new-frame-labels" onClick={this.handleNewFrameLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> New Frame Labels
              </button>
              <button type="button" className="btn btn-info new-object-labels" onClick={this.handleNewObjectLabels}>
                <span className="glyphicon glyphicon-plus-sign"></span> New Object Labels
              </button>
            </div>
            {
            self.state.labelInfoLists.map(function(labelInfo, index) {
              return (
                <LabelInfo key={index} isFrameLabels={labelInfo.isFrameLabels}/>
              );
            })
            }
          </div>
          <Video playlistName={self.playlistName} start={self.start} end={self.end} ref={"videojs"}/>
        </div>
      </div>
    );
  }
}
