import React from "react";

export default class Contact extends React.Component {
  render() {
    return (
      <footer className="text-center">
        <div className="footer-above">
            <div className="container">
                <div className="row">
                    <div className="footer-col col-md-4">
                        <h3>Location</h3>
                        <p>353 Serra Mall
                            <br />Stanford, CA 94305</p>
                    </div>
                    <div className="footer-col col-md-4">
                        <h3>Around the Web</h3>
                        <ul className="list-inline">
                            <li>
                                <a href="#" className="btn-social btn-outline"><i className="fa fa-fw fa-facebook"></i></a>
                            </li>
                            <li>
                                <a href="#" className="btn-social btn-outline"><i className="fa fa-fw fa-google-plus"></i></a>
                            </li>
                            <li>
                                <a href="#" className="btn-social btn-outline"><i className="fa fa-fw fa-twitter"></i></a>
                            </li>
                            <li>
                                <a href="#" className="btn-social btn-outline"><i className="fa fa-fw fa-linkedin"></i></a>
                            </li>
                            <li>
                                <a href="#" className="btn-social btn-outline"><i className="fa fa-fw fa-dribbble"></i></a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-col col-md-4">
                        <h3>About Deep Annotation</h3>
                        <p>Deep annotator is created by <a href="http://www.zelunluo.com">Alan Luo</a> and <a href="http://emmabypeng.github.io/">Emma Peng</a>.</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer-below">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        Copyright &copy; Deep Annotator 2016
                    </div>
                </div>
            </div>
        </div>
      </footer>
    );
  }
}
