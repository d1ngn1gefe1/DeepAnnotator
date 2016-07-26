import React from "react";

export default class AnnotatorNavigation extends React.Component {
  render() {
    self = this;

    return (
      <nav id="annotatorNav" className="navbar navbar-default navbar-fixed-top navbar-custom affix">
        <div className="container">
          {/* Brand and toggle get grouped for better mobile display */}
          <div className="navbar-header page-scroll">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span> Menu <i className="fa fa-bars"></i>
            </button>
            <a className="navbar-brand" href="#page-top">
              Deep Annotator
              <p className="navbar-description">{self.props.description}</p>
            </a>
          </div>

          {/* Collect the nav links, forms, and other content for toggling */}
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-right">
              <li className="hidden">
                <a href="#page-top"></a>
              </li>
              <li className="page-scroll">
                <a href="/">Go Back</a>
              </li>
              <li className="page-scroll">
                <a href="/logout">Logout</a>
              </li>
            </ul>
          </div>
          {/* navbar-collapse */}
        </div>
      {/* container-fluid */}
      </nav>
    );
  }
}

AnnotatorNavigation.propTypes = {
  description: React.PropTypes.string.isRequired
};
