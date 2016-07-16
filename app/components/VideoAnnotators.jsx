import React from "react";
import VideoAnnotator from "./VideoAnnotator.jsx";

export default class VideoAnnotators extends React.Component {
  render() {
    var thumbnails = ["cabin", "cake", "circus", "game", "safe", "submarine"];
    return (
      <div>{
      thumbnails.map(function(thumbnail, index) {
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
                                  <h2>{thumbnail}</h2>
                                  <hr className="star-primary"></hr>

                                  <VideoAnnotator videoId={index} thumbnail={thumbnail}/>

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
