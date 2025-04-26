
import React, { useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { Sheet } from 'react-modal-sheet';

import './style.css';

import './styles/main.scss';




function App() {

  // sheet

  const [isOpen, setOpen] = useState(false);





  // confet
  const [showConfetti, setShowConfetti] = useState(false);

  const throwConfet = () => {
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
          <button id="about" onClick={() => setOpen(true)}>About</button>

      </header>

      <div className="logo-container">
          <h1>Joyfulist</h1>
          <h2>Your daily dose of joy</h2>
      </div>

      <div className="panel">
          <div className="header">
              <p className="caption">At least one a day keeps the streak alive!</p>
              <button id="refresh-btn">4</button>
          </div>

          <div id="tasks">
            <p onClick={throwConfet}>Task</p>
            <p>Task</p>
            <p>Task</p>
          </div>

          <div className="share">
              <button id="share">Share with your friends</button>
          </div>
      </div>

      <Sheet 
        isOpen={isOpen} 
        detent={"content-height"}
        tweenConfig={{ ease: 'easeOut', duration: 0.4 }}
        onClose={() => setOpen(false)
      }>
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div>

              <div className="header">
                  <p  className="caption">About Joyfulist</p>
                  <div><button id="close-btn" onClick={() => setOpen(false)}>Close</button></div>
              </div>

              <div className="content">
                  <img src="/assets/sparkle.png" alt="" />
                  <p><span>Joyfulist</span> was created by <a href="https://www.theonboardinglab.com/" target="_blank">Clare</a> and <a href="https://sandro.design" target="_blank">Sandro</a> in hopes to bring a little more joy into your life.</p>
              </div>

              <div className="content">
                  <img src="/assets/icon.png" alt="" />

                  <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
              </div>

            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>

    /* sheet content 

    


          */






  );
}

export default App;
