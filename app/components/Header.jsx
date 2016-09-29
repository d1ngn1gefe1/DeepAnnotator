import React from "react";

export default class Header extends React.Component {
  render() {
    return (
      <header className="header" style={{backgroundImage: "url(./static/img/bg.jpg)"}}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <img className="img-responsive icon-header" src="./static/img/icon2.svg" alt="" />
                      <div className="intro-text">
                          <span className="name">Deep Annotator</span>
                          <span className ="skills">Free - Online - Interactive</span>
                      </div>
                  </div>
              </div>
          </div>
      </header>
    );
  }
}
