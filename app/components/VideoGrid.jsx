import React from "react";
import info from '../../public/video/info.json';

export default class VideoGrid extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  render() {
    var self = this;

    return (
      <section id="video-grid">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h2>Videos</h2>
              <hr className="star-primary"></hr>
            </div>
          </div>

          <div className="row">{
            self.props.playlists.map(function(playlist, index) {
              var thumbnail = "video/"+playlist+"/"+self.props.start_index[index]+"/"+self.props.thumbnailName

              return (
                <div className="col-sm-4 video-annotator-item" key={index}>
                  <a href={"#video-annotator-modal"+index} className="video-annotator-link" data-toggle="modal">
                    <div className="caption">
                      <div className="caption-content">
                        <i className="fa fa-pencil fa-3x"></i>
                      </div>
                    </div>
                    <img src={thumbnail} className="img-responsive" alt=""></img>
                    <div className="playlist-label">
                      <h3>{playlist}</h3>
                      <h4>{"video "+self.props.start_index[index]+" - "+(self.props.end_index[index]-1)}</h4>
                    </div>
                  </a>
                </div>
              );
            })
          }</div>
        </div>
      </section>
    );
  }
}

VideoGrid.propTypes = {
  height: React.PropTypes.number,
  width: React.PropTypes.number,
  videoName: React.PropTypes.string,
  thumbnailName: React.PropTypes.string
};

VideoGrid.defaultProps = {
  height: 240,
  width: 320,
  videoName: "depth.mp4",
  thumbnailName: "thumbnail.jpg",
  playlists: info.playlists,
  start_index: info.start_index,
  end_index: info.end_index
};
