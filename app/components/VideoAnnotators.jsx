import React from "react";
import VideoAnnotator from "./VideoAnnotator.jsx";
import info from '../../public/video/info.json';

export default class VideoAnnotators extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  render() {
    var self = this;

    return (
      <div>{
      self.props.playlists.map(function(playlistName, index) {
        var playlistLabel = "video "+self.props.start_index[index]+" - "+(self.props.end_index[index]-1)

        return (
          <div className="video-annotator-modal modal fade" key={index} id={"video-annotator-modal"+index} tabIndex="-1" role="dialog" aria-hidden="true">
              <div className="modal-content">
                  <div className="close-modal" data-dismiss="modal">
                      <div className="lr">
                          <div className="rl"></div>
                      </div>
                  </div>
                  <div className="container">
                      <div className="row">
                          <div className="col-lg-8 col-lg-offset-2">
                              <div className="modal-body">
                                  <h2>{playlistLabel}</h2>
                                  <hr className="star-primary"></hr>

                                  <VideoAnnotator start={self.props.start_index[index]} end={self.props.end_index[index]} playlistName={playlistName}/>

                                  <ul className="list-inline item-details">
                                      <li>Client:
                                          <strong><a href="http://startbootstrap.com">Start Bootstrap</a>
                                          </strong>
                                      </li>
                                      <li>Date:
                                          <strong><a href="http://startbootstrap.com">April 2014</a>
                                          </strong>
                                      </li>
                                      <li>Service:
                                          <strong><a href="http://startbootstrap.com">Web Development</a>
                                          </strong>
                                      </li>
                                  </ul>
                                  <button type="button" className="btn btn-default" data-dismiss="modal"><i className="fa fa-times"></i> Close</button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        );
      })
      }</div>
    );
  }
}

VideoAnnotators.defaultProps = {
  playlists: info.playlists,
  start_index: info.start_index,
  end_index: info.end_index
};
