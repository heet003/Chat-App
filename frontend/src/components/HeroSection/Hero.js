import React from "react";
import "./Hero.css";

function Hero(props) {
  return (
    <div className="hero-container">
      <div className="hero-text">
        <span className="first">One Click.</span>
        <span className="second"> Zero Friction</span>
        <p>
          Welcome to our innovative chat application, designed to make
          communication seamless and enjoyable.
        </p>
      </div>
      <main className="main">
        <div className="hero-section">
          <div className="center-image">
            <img src="./images/1.png" alt="Lady Chatting" />
          </div>
          <div className="chat-images">
            <img src="./images/chat1.png" className="chat chat1" alt="Chat 1" />
            <img src="./images/chat2.png" className="chat chat2" alt="Chat 2" />
            <img src="./images/chat3.png" className="chat chat3" alt="Chat 3" />
            <img src="./images/chat4.png" className="chat chat4" alt="Chat 4" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Hero;
