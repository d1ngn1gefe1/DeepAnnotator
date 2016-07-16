import React from "react";

export default class VideoGrid extends React.Component {
  render() {
    var thumbnails = ["cabin", "cake", "circus", "game", "safe", "submarine"];
    
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
          thumbnails.map(function(thumbnail, index) {
            return (
              <div className="col-sm-4 video-annotator-item" key={index}>
                <a href={"#video-annotator-modal"+index} className="video-annotator-link" data-toggle="modal">
                  <div className="caption">
                    <div className="caption-content">
                      <i className="fa fa-pencil fa-3x"></i>
                    </div>
                  </div>
                  <img src={"img/video-annotator/"+thumbnail+".png"} className="img-responsive" alt=""></img>
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
