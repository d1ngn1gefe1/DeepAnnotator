import React from "react";

export default class VideoGrid extends React.Component {
  // similar to componentWillMount in ES5
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  render() {
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
          this.props.players.map(function(thumbnail, index) {
            return (
              <div className="col-sm-4 video-annotator-item" key={index}>
                <a href={"#video-annotator-modal"+index} className="video-annotator-link" data-toggle="modal">
                  <div className="caption">
                    <div className="caption-content">
                      <i className="fa fa-pencil fa-3x"></i>
                    </div>
                  </div>
                  <img src={"video/-annotator/"+thumbnail+".png"} className="img-responsive" alt=""></img>
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
  height: React.propTypes.number,
  width: React.propTypes.number,
  videoName: React.propTypes.string,
  thumbnailName: React.propTypes.string
};

VideoGrid.defaultProps = {
  height: 240,
  width: 320,
  videoName: "depth.mp4",
  thumbnailName: "thumbnail.jpg",
  folders = ["10.233.219.150", "10.233.219.169"],
  lengths = [22, 18]
};
