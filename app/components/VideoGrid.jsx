import React from "react";
import { Link } from "react-router";
import info from "../../public/static/video/info.json";

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
            self.props.playlists.map(function(playlistName, index) {
              var thumbnail = "./static/video/"+playlistName+"/"+self.props.start_index[index]+"/thumbnail.jpg";
              var playlistLabel = "video "+self.props.start_index[index]+" - "+(self.props.end_index[index]-1);
              var link = "/"+playlistName+"/"+self.props.start_index[index]+"-"+(self.props.end_index[index]-1);

              return (
                <div className="col-sm-4 video-annotator-item" key={index}>
                  <Link to={link} className="video-annotator-link" data-toggle="modal">
                    <div className="caption">
                      <div className="caption-content">
                        <i className="fa fa-pencil fa-3x"></i>
                      </div>
                    </div>
                    <img src={thumbnail} className="img-responsive" alt=""></img>
                    <div className="playlist-label">
                      <h3>{playlistName}</h3>
                      <h4>{playlistLabel}</h4>
                    </div>
                  </Link>
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
};

VideoGrid.defaultProps = {
  playlists: info.playlists,
  start_index: info.start_index,
  end_index: info.end_index
};
