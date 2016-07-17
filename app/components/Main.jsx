import React from "react";
import ReactDOM from "react-dom";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import Navigation from "./Navigation.jsx";
import VideoAnnotators from "./VideoAnnotators.jsx";
import VideoGrid from "./VideoGrid.jsx";

import "../css/freelancer.css";
import "../less/freelancer.less";
import "../less/mixins.less";
import "../less/variables.less";
import "../css/video.css";
import "../css/videojs-playlist-ui.vertical.css"

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

        <VideoAnnotators />
      </div>
    );
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById("app")
);
