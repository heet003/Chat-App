import React from "react";
import "./Footer.css";
function Footer(props) {
  return (
    <footer>
      <div className="footer-content">
        <p>Contact us: contact@theopenmic.com</p>
        <div className="social-media">
          <a href="https://facebook.com">Facebook</a>
          <a href="https://twitter.com">Twitter</a>
          <a href="https://instagram.com">Instagram</a>
        </div>
      </div>
      <div className="legal">
        <a href="/">Terms of Service</a>
        <a href="/">Privacy Policy</a>
      </div>
    </footer>
  );
}

export default Footer;
