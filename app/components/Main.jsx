import React from "react";
import ReactDOM, { render } from "react-dom";
import { Router, Route, hashHistory } from "react-router";
// import "jquery"
// import "bootstrap"
import "font-awesome-loader"
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import Navigation from "./Navigation.jsx";
import VideoAnnotator from "./VideoAnnotator.jsx";
import VideoGrid from "./VideoGrid.jsx";

import "../css/main.scss";
import "../css/nouislider.css"

class Main extends React.Component {
  render() {
    return (
      <div>
        <Navigation />
        <Header />
        <VideoGrid />
        <About />
        <Contact />
        <Footer />

        {/* Scroll to Top Button (Only visible on small and extra-small screen sizes) */}
        <div className="scroll-top page-scroll hidden-sm hidden-xs hidden-lg hidden-md">
          <a className="btn btn-primary" href="#page-top">
            <i className="fa fa-chevron-up"></i>
          </a>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById("app")
);

render((
  <Router history={hashHistory}>
    <Route path="/" component={Main}/>
    <Route path="/:playlistName/:range" component={VideoAnnotator} />
  </Router>
), document.getElementById("app"))
