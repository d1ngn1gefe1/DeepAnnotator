import React from "react";

export default class About extends React.Component {
  render() {
    return (
      <section className="success" id="about">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <h2>About</h2>
                      <hr className="star-light" />
                  </div>
              </div>
              <div className="row">
                  <div className="col-lg-4 col-lg-offset-2">
                      <p>Deep Annotator is a free, online, interactive video annotation tool for computer vision research that crowdsources work to Amazon Mechanical Turk.</p>
                  </div>
                  <div className="col-lg-4">
                      <p>Our tool makes it easy to build massive, affordable video datasets and can be deployed on a cloud. It also supports offline mode for expert annotator use. </p>
                  </div>
                  <div className="col-lg-8 col-lg-offset-2 text-center">
                      <a href="http://vision.stanford.edu/" className="btn btn-lg btn-outline">
                          <i className="fa fa-thumbs-o-up"></i> Like
                      </a>
                  </div>
              </div>
          </div>
      </section>
    );
  }
}
