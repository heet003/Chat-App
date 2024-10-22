import React from "react";
import "./About.css";

function About() {
  return (
    <div className="aboutus-container">
      <div className="aboutus-header">
        <h1>About Us</h1>
        <p>Discover the story behind Open Mic</p>
      </div>
      <div className="aboutus-content">
        <div className="aboutus-section">
          <img
            src="./images/team.png"
            alt="Team Collaboration"
            className="aboutus-image"
          />
          <div className="aboutus-text">
            <h2>Our Mission</h2>
            <p>
              At Open Mic, our mission is to provide a seamless and enjoyable
              communication experience. We believe in breaking down barriers and
              making it easy for people to connect with each other, no matter
              where they are in the world.
            </p>
          </div>
        </div>
        <div className="aboutus-section reverse">
          <div className="aboutus-text">
            <h2>Our Vision</h2>
            <p>
              We envision a world where communication is effortless and
              frictionless. Our app is designed with advanced features and an
              intuitive interface to ensure that you can stay connected with
              your loved ones anytime, anywhere.
            </p>
          </div>
          <img
            src="./images/happyUsers.png"
            alt="Happy Users"
            className="aboutus-image"
          />
        </div>
        <div className="aboutus-section">
          <img
            src="./images/globalNetwork.jpg"
            alt="Global Connectivity"
            className="aboutus-image"
          />
          <div className="aboutus-text">
            <h2>Why Choose Open Mic?</h2>
            <p>
              Open Mic offers a unique chat experience with innovative features
              that set us apart from the rest. Our user-friendly design ensures
              that everyone can enjoy seamless communication without any hassle.
              Join us and be a part of the revolution in digital communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
