var VideoAnnotator = React.createClass({
  propTypes: {
    videoId: React.PropTypes.number,
    videoPartId: React.PropTypes.number,
    thumbnail: React.PropTypes.string,
  },

  render: function() {
    return (
      <video id={"video"+this.props.videoId} className="video-js" controls preload="auto" width="640" height="480" poster={"img/video-annotator/"+this.props.thumbnail+".png"} data-setup="{}">
        <source src="video/example.mp4" type='video/mp4' />
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
    );
  }
});


var VideoAnnotators = React.createClass({
  render: function() {
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
});

ReactDOM.render(
  <VideoAnnotators/>,
  document.getElementById("video-annotators")
);
