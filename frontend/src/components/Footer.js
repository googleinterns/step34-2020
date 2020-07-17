import React from 'react';
import '../App.css';

const Footer = () => {
  return (
    <div className="footer-content">
      <div className="container">
        <div className="row">
          {/* Owner's column */}
          <div className="col-md-3 col-sm-6">
            <h4>Owner</h4>
            <ul className="list-unstyled">
              <li>Google LLC</li>
            </ul>
            <h4>Sponsors</h4>
            <ul className="list-unstyled">
              <li>Daniel Teh</li>
              <li>Dan Ho</li>
            </ul>
          </div>
          {/* contributor's colum */}
          <div className="col-md-3 col-sm-6">
            <h4>Founders</h4>
            <ul className="list-unstyled">
              <li>Maya Patel</li>
              <li>John Kim</li>
              <li>Mico Theogene Micomyiza</li>
            </ul>
          </div>
          {/* mission's colum */}
          <div className="col-md-3 col-sm-6">
            <h4>Mission</h4>
            <p>
              The objective of MapIT is to manage and visualize student-created public events, 
              and expose these events to their college community.<br />
              We are here to help you explore campus events beyond your social circle.<br/>
            </p>
          </div>
          {/* source code's colum */}
          <div className="col-md-3 col-sm-6">
            <h4>Source code</h4>
            <a color='white' href="https://github.com/googleinterns/step34-2020">GitHub</a>
          </div>
        </div>
        {/* copyright */}
        <div className="footer-bottom">
          <p className="text-xs-center">
            &copy;{new Date().getFullYear()} MapIT
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer;
