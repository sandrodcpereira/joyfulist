
import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { createBottomSheet } from '@plainsheet/core';
import './App.css';
import './style.css';


function App() {
  // sheet

  useEffect(() => {
    const bottomSheet = createBottomSheet({
      content: '<h2>Hello</h2><p>This is a custom sheet!</p>',
      options: {
        position: 'bottom',
        duration: 300,
      },
    });

    bottomSheet.mount();

    return () => {
      bottomSheet.unmount();
    };
  }, []);

  const showSheet = () => {
    const bottomSheet = createBottomSheet({
      content: `
        <div className="main-container overlay">
          <div className="controls">
              <p>About</p>
              <button id="close-btn">Close</button>
          </div>

          <div className="content">
              <img src="/assets/sparkle.png" alt="" style="width: 54px" />
              <p><span>Joyfulist</span> was created by <a href="https://www.theonboardinglab.com/" target="_blank">Clare</a> and <a href="https://sandro.design" target="_blank">Sandro</a> in hopes to bring a little more joy into your life.</p>
          </div>

          <div className="content">
              <img src="/assets/icon.png" alt="" style="width: 54px" />

              <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
          </div>
        </div>
    `,
      options: {
        position: 'bottom',
        duration: 300,
      },
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
      <h1>Hello world</h1>

      

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

      <div class="wrapper">

          <header>
              <button id="about" onClick={showSheet}>About</button>

              <button onClick={handleClick}>Celebrate!</button>
          </header>

          <div class="logo-container">
              <h1>Joyfulist</h1>
              <h2>Your daily dose of joy</h2>
          </div>

          <div class="main-container">
              <div class="controls">
                  <p>Your tasks for today</p>
                  <button id="refresh-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 17 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.89 5.0001H6.5V6.0001H2.5V2.0001H3.5V3.8401C4.35447 2.81144 5.50541 2.07136 6.79589 1.72077C8.08637 1.37018 9.45358 1.42615 10.7111 1.88104C11.9686 2.33593 13.0552 3.1676 13.8227 4.26265C14.5903 5.35771 15.0014 6.66285 15 8.0001H14C14.0001 6.81439 13.617 5.66041 12.9078 4.71016C12.1986 3.75992 11.2013 3.0643 10.0646 2.72699C8.9279 2.38969 7.71261 2.42876 6.59991 2.83839C5.48721 3.24802 4.53667 4.00626 3.89 5.0001ZM13.11 11H10.5V10H14.5V14H13.5V12.16C12.6455 13.1887 11.4946 13.9287 10.2041 14.2793C8.91363 14.6299 7.54642 14.574 6.28892 14.1191C5.03141 13.6642 3.9448 12.8325 3.17727 11.7374C2.40973 10.6424 1.99863 9.33726 2 8H3C2.99993 9.18571 3.38303 10.3397 4.09221 11.2899C4.80139 12.2402 5.79867 12.9358 6.93539 13.2731C8.0721 13.6104 9.28739 13.5713 10.4001 13.1617C11.5128 12.7521 12.4633 11.9938 13.11 11Z" fill="#F0B833"/>
                      </svg>
                  </button>
              </div>

              <div id="tasks-container"></div>

              <div class="share">
                  <button id="share">Share with your friends</button>
              </div>
          </div>

        </div>

    </div>






  );
}

export default App;
