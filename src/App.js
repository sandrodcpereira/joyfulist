
import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { createBottomSheet } from '@plainsheet/core';
// import './App.css';
import './style.css';

import './styles/main.scss';



function App() {
  // sheet

  const showSheet = () => {
    const bottomSheet = createBottomSheet({
  content: `  
          <div className="content">
              <img src="/assets/sparkle.png" alt="" style="width: 54px" />
              <p><span>Joyfulist</span> was created by <a href="https://www.theonboardinglab.com/" target="_blank">Clare</a> and <a href="https://sandro.design" target="_blank">Sandro</a> in hopes to bring a little more joy into your life.</p>
          </div>

          <div className="content">
              <img src="/assets/icon.png" alt="" style="width: 54px" />

              <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
          </div>
          <!--div><button id="close-btn">Close</button></div-->
    `,
    draggingAnimationTimings: "spring",
    expandable: false,
    dragTriggers: [".pbs-content"],
    backdropColor: "rgba(0, 0, 0, 0.20)",
    draggingAnimationDuration: 500,

});

    bottomSheet.mount();
    bottomSheet.open();
  };



  // confet
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    setShowConfetti(true);
    // Reset the confetti after 3 seconds so it doesn't keep showing
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000); // 3 seconds
  };

  return (
    <div>     

      {/* Display ConfettiBoom if showConfetti is true */}
      {showConfetti && 
        <ConfettiBoom 
          mode={'boom'}
          deg={270}
          shapeSize={30}
          spreadDeg={100}
          particleCount={500} 
          launchSpeed={1}
          numBooms={1} // How many booms of confetti you want
          duration={2} // Duration of each confetti burst in ms
          colors={[
            '#7700FF', 
            '#FFC500', 
            '#ffffff', 
            '#00A88A'
            ]} // Customize the colors of confetti
      />}


      <header>
          <button id="about" onClick={showSheet}>About</button>

          <button onClick={handleClick}>Confetti</button>
      </header>

      <div className="logo-container">
          <h1>Joyfulist</h1>
          <h2>Your daily dose of joy</h2>
      </div>

      <div className="content-container">
          <div className="controls">
              <p>Your tasks for today</p>
              <button id="refresh-btn">Refresh</button>
          </div>

          <div id="tasks">
            [tasks go here]
          </div>

          <div className="share">
              <button id="share">Share with your friends</button>
          </div>
      </div>

    </div>

    






  );
}

export default App;
