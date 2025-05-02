import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { Sheet } from 'react-modal-sheet';
import './styles/main.scss';

function App() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(['Tap', 'To', 'Show']);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [tasksDisabled, setTasksDisabled] = useState(true);
  const [showRevealButton, setShowRevealButton] = useState(true);
  const [showShareButton, setShowShareButton] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    // Load completed tasks
    const storedCompletedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    setCompletedTasks(storedCompletedTasks);

    // Load streak data
    const streakData = JSON.parse(localStorage.getItem('streakData') || '{}');
    setStreak(parseInt(streakData.streak || '0', 10));
    setLastCompletedDate(streakData.lastCompletedDate || null);

    // Load tasks.json
    const loadTasks = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/tasks.json`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();

    // Set up midnight reset
    setupMidnightReset();
  }, []);

  // Function to set up the midnight reset
  const setupMidnightReset = () => {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = nextMidnight - now;
    
    setTimeout(() => {
      resetApp();
      setupMidnightReset(); // Set up next day's reset
    }, timeUntilMidnight + 1000); // Add 1 second buffer
  };

  // State for tracking checkbox states
  const [checkedState, setCheckedState] = useState([false, false, false]);

  // Reset app state (for midnight or debug)
  const resetApp = () => {
    // Check if user completed any tasks in the last 24 hours
    const now = new Date();
    const lastDate = lastCompletedDate ? new Date(lastCompletedDate) : null;
    const msIn24Hours = 24 * 60 * 60 * 1000;
    const lastWasWithin24h = lastDate && (now - lastDate) < msIn24Hours;

    // Reset streak if no tasks were completed in last 24 hours
    if (!lastWasWithin24h && streak > 0) {
      setStreak(0);
      const newStreakData = { streak: 0, lastCompletedDate: null };
      localStorage.setItem('streakData', JSON.stringify(newStreakData));
    }

    // Reset tasks UI
    setSelectedTasks(['Tap', 'To', 'Show']);
    setTasksDisabled(true);
    setShowRevealButton(true);
    setShowShareButton(false);
    
    // Reset all checkboxes to unchecked
    setCheckedState([false, false, false]);
  };

  // Select random tasks function
  const selectRandomTasks = () => {
    // Filter out tasks that have been completed
    const availableTasks = tasks.filter(task => !completedTasks.includes(task));
    
    // Select 3 random tasks
    const randomTasks = [];
    const tempAvailable = [...availableTasks];
    
    while (randomTasks.length < 3 && tempAvailable.length > 0) {
      const randomIndex = Math.floor(Math.random() * tempAvailable.length);
      randomTasks.push(tempAvailable[randomIndex]);
      tempAvailable.splice(randomIndex, 1);
    }

    // If we don't have enough tasks, fill with default messages
    while (randomTasks.length < 3) {
      randomTasks.push(`Task ${randomTasks.length + 1} (All tasks completed!)`);
    }

    // Update state
    setSelectedTasks(randomTasks);
    setTasksDisabled(false);
    setShowRevealButton(false);
    setShowShareButton(true);
  };

  // Handle task completion
  const handleTaskCompletion = (taskIndex) => {
    const taskText = selectedTasks[taskIndex];
    
    // Skip if it's a placeholder text
    if (['Tap', 'To', 'Show'].includes(taskText)) {
      return;
    }
    
    // Update completed tasks
    if (!completedTasks.includes(taskText)) {
      const newCompletedTasks = [...completedTasks, taskText];
      setCompletedTasks(newCompletedTasks);
      localStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
    }
    
    // Update streak if it's a new day
    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-02"
    
    if (lastCompletedDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastCompletedDate(today);
      
      // Store streak data
      const streakData = { streak: newStreak, lastCompletedDate: today };
      localStorage.setItem('streakData', JSON.stringify(streakData));
      
      // Trigger confetti only when streak is updated
      setShowConfetti(true);
      
      // Reset confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    }
  };

  // For debug - to manually trigger confetti
  const throwConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Share functionality
  const shareJoy = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Joyfulist',
        text: `I'm on a ${streak}-day joy streak with Joyfulist! Today I completed: ${selectedTasks.join(', ')}`,
        url: window.location.href
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser. Try copying the URL manually!');
    }
  };

  return (
    <div className="joyfulist-app">
      {showConfetti && 
        <ConfettiBoom 
          mode={'boom'}
          x={0.75}
          y={0.02}
          deg={120}
          shapeSize={25}
          spreadDeg={100}
          particleCount={100} 
          launchSpeed={0.8}
          colors={[
            '#6900E0', 
            '#FFC500', 
            '#ffffff', 
            '#00A88A'
          ]}
        />
      }

      <header>
        <button id="about" onClick={() => setOpen(true)}>About</button>
        <div id="streak">
          {streak === 0 
            ? "✨ No streak yet" 
            : `🔥 ${streak} day streak!`
          }
        </div>
      </header>

      <div className="logo-container">
        <h1>Joyfulist</h1>
        <h2>Your daily dose of joy</h2>
      </div>

      <div className="panel">
        <div className="header">
          <p className="caption">Tick at least one to keep your streak going!</p>
        </div>

        <div id="tasks">
          {selectedTasks.map((task, index) => (
            <div key={index} className={tasksDisabled ? 'disabled' : ''}>
              <input 
                type="checkbox" 
                id={`task${index + 1}`}
                checked={checkedState[index]}
                onChange={() => {
                  // Update checked state
                  const newCheckedState = [...checkedState];
                  newCheckedState[index] = !newCheckedState[index];
                  setCheckedState(newCheckedState);
                  
                  // Only process completion if being checked
                  if (!checkedState[index]) {
                    handleTaskCompletion(index);
                  }
                }}
              />
              <label className={`taskLabel${index + 1}`} htmlFor={`task${index + 1}`}>
                {task}
              </label>
            </div>
          ))}
        </div>

        <div className="cta">
          {showRevealButton && (
            <button id="showTasks" onClick={selectRandomTasks}>
              Show me today's tasks!
            </button>
          )}
          {showShareButton && (
            <button id="share" onClick={shareJoy}>
              Share the joy!
            </button>
          )}
        </div>
      </div>

      <Sheet 
        isOpen={isOpen} 
        detent="content-height"
        tweenConfig={{ ease: 'easeOut', duration: 0.4 }}
        onClose={() => setOpen(false)}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div>
              <div className="header">
                <p className="caption">About Joyfulist</p>
                <div><button id="close-btn" onClick={() => setOpen(false)}>Close</button></div>
              </div>

              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" />
                <p>
                  <span>Joyfulist</span> was created by <a href="https://www.theonboardinglab.com/" target="_blank" rel="noreferrer noopener">Clare</a> and <a href="https://sandro.design" target="_blank" rel="noreferrer noopener">Sandro</a> in hopes to bring a little more joy into your life.
                </p>
              </div>

              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/icon.png`} alt="App icon" />
                <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
              </div>

              <div className="debug">

                <p className="caption" onClick={resetApp}>Reset app</p>
                <p className="caption" onClick={() => {
                  // Reset just the streak
                  setStreak(0);
                  setLastCompletedDate(null);
                  localStorage.setItem('streakData', JSON.stringify({ streak: 0, lastCompletedDate: null }));
                }}>Reset streak</p>

                <p className="caption" onClick={() => {
                    localStorage.removeItem('completedTasks'); // Removes just this item
                }}>Clear cache</p>

              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>
  );
}

export default App;