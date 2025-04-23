
import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { createBottomSheet } from '@plainsheet/core';
import './App.css';


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
      content: '<h2>Hello</h2><p>This is a custom sheet!</p>',
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

      <button onClick={handleClick}>Celebrate!</button>

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
          colors={['#ff0000', '#00ff00', '#0000ff']} // Customize the colors of confetti
      />}

      <button onClick={showSheet}>Show Sheet</button>

    </div>


  );
}

export default App;
