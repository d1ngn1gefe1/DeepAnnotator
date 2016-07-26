import React from "react";

export default class Header extends React.Component {
  render() {
    return (
      <header>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <img className="img-responsive icon-header" src="./static/img/profile.png" alt="" />
                      <div className="intro-text">
                          <span className="name">Deep Annotator</span>
                          <hr className="star-light" />
                          <span className ="skills">Free - Online - Interactive</span>
                      </div>
                  </div>
              </div>
          </div>
      </header>
    );
  }
}
