import React, { useEffect, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { Sheet } from 'react-modal-sheet';
import Sparkles from './sparkle.js';
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
  const [todayDate, setTodayDate] = useState('');
  const [tasksSelectedToday, setTasksSelectedToday] = useState(false);
  
  // State for animation control
  const [visibleTasks, setVisibleTasks] = useState([false, false, false]);
  const [showInitialState, setShowInitialState] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  
  // State for tracking checkbox states
  const [checkedState, setCheckedState] = useState([false, false, false]);

  // Load initial data from localStorage
  useEffect(() => {
    // Set today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    setTodayDate(today);

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

    // Check if tasks have been selected today
    const dailyTasksData = JSON.parse(localStorage.getItem('dailyTasksData') || '{}');
    
    if (dailyTasksData.date === today && dailyTasksData.tasks && dailyTasksData.tasks.length === 3) {
      // Restore today's tasks
      setSelectedTasks(dailyTasksData.tasks);
      setTasksDisabled(false);
      setShowRevealButton(false);
      setShowShareButton(true);
      setTasksSelectedToday(true);
      
      // Set visibility states for elements
      setShowInitialState(false);
      setHeaderVisible(true);
      setCtaVisible(true);
      
      // Restore checked state if available
      if (dailyTasksData.checkedState && dailyTasksData.checkedState.length === 3) {
        setCheckedState(dailyTasksData.checkedState);
      }
      
      // Show tasks with animation
      setVisibleTasks([true, true, true]);
    }

    // Set up midnight reset
    setupMidnightReset();
  }, []);

  // Save checked state whenever it changes
  useEffect(() => {
    if (!tasksDisabled && tasksSelectedToday) {
      const dailyTasksData = JSON.parse(localStorage.getItem('dailyTasksData') || '{}');
      if (dailyTasksData.date === todayDate) {
        localStorage.setItem('dailyTasksData', JSON.stringify({
          ...dailyTasksData,
          checkedState: checkedState
        }));
      }
    }
  }, [checkedState, tasksDisabled, tasksSelectedToday, todayDate]);

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

    // Update today's date
    const today = new Date().toISOString().split('T')[0];
    setTodayDate(today);
    
    // Reset daily tasks data
    setTasksSelectedToday(false);

    // Reset tasks UI
    setSelectedTasks(['Tap', 'To', 'Show']);
    setTasksDisabled(true);
    setShowRevealButton(true);
    setShowShareButton(false);
    
    // Reset all checkboxes to unchecked
    setCheckedState([false, false, false]);
    
    // Reset visibility states
    setShowInitialState(true);
    setHeaderVisible(false);
    setCtaVisible(false);
    setVisibleTasks([false, false, false]);
  };

  // Select random tasks function
  const selectRandomTasks = () => {
    // Only proceed if tasks are currently disabled (no tasks have been selected yet)
    if (!tasksDisabled) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have saved tasks for today
    const dailyTasksData = JSON.parse(localStorage.getItem('dailyTasksData') || '{}');
    
    let tasksList = [];
    
    if (dailyTasksData.date === today && dailyTasksData.tasks && dailyTasksData.tasks.length === 3) {
      // Use stored tasks for today
      tasksList = dailyTasksData.tasks;
      
      // Restore checked state if available
      if (dailyTasksData.checkedState && dailyTasksData.checkedState.length === 3) {
        setCheckedState(dailyTasksData.checkedState);
      }
    } else {
      // Generate new tasks for today
      // Filter out tasks that have been completed
      const availableTasks = tasks.filter(task => !completedTasks.includes(task));
      
      // Select 3 random tasks
      tasksList = [];
      const tempAvailable = [...availableTasks];
      
      while (tasksList.length < 3 && tempAvailable.length > 0) {
        const randomIndex = Math.floor(Math.random() * tempAvailable.length);
        tasksList.push(tempAvailable[randomIndex]);
        tempAvailable.splice(randomIndex, 1);
      }
  
      // If we don't have enough tasks, fill with default messages
      while (tasksList.length < 3) {
        tasksList.push(`[oh boy]`);
      }
      
      // Store today's tasks in localStorage
      localStorage.setItem('dailyTasksData', JSON.stringify({
        date: today,
        tasks: tasksList,
        checkedState: [false, false, false]
      }));
    }

    // Update state
    setSelectedTasks(tasksList);
    setTasksDisabled(false);
    setShowRevealButton(false);
    setShowShareButton(true);
    setTasksSelectedToday(true);
    
    // Start the animation sequence
    // 1. Fade out initialState
    setShowInitialState(false);
    
    // 2. Fade in header after initialState fades out
    setTimeout(() => {
      setHeaderVisible(true);
    }, 300);
    
    // 3. Fade in tasks one by one
    setTimeout(() => setVisibleTasks(prev => [true, false, false]), 600);
    setTimeout(() => setVisibleTasks(prev => [true, true, false]), 900);
    setTimeout(() => setVisibleTasks(prev => [true, true, true]), 1200);
    
    // 4. Finally show the CTA (share button)
    setTimeout(() => {
      setCtaVisible(true);
    }, 1500);
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
      handleStreakPop();
      setShowConfetti(true);
      
      // Reset confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    }
  };

  // Share functionality
  const shareJoy = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Joyfulist',
        text: `I'm on a ${streak}-day joy streak with Joyfulist! My tasks for today are: ${selectedTasks.join(', ')}. What are yours?`,
        url: window.location.href
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      alert('Sharing not supported on this browser. Try copying the URL manually!');
    }
  };
  
  // Handle panel click - only triggers selectRandomTasks if tasks are disabled
  const handlePanelClick = () => {
    if (tasksDisabled) {
      selectRandomTasks();
    }
  };

  // Add a debug function to reset daily tasks
  const resetDailyTasks = () => {
    localStorage.removeItem('dailyTasksData');
    setTasksSelectedToday(false);
    setSelectedTasks(['Tap', 'To', 'Show']);
    setTasksDisabled(true);
    setShowRevealButton(true);
    setShowShareButton(false);
    setCheckedState([false, false, false]);
    
    // Reset visibility states
    setShowInitialState(true);
    setHeaderVisible(false);
    setCtaVisible(false);
    setVisibleTasks([false, false, false]);
  };


  // Toggle debug controls
  const toggleDebug = () => {
    const debugElement = document.querySelector('.debug');
    if (debugElement) {
      debugElement.style.display = debugElement.style.display === 'flex' ? 'none' : 'flex';
    }
  };

  // Streak pop function
    
  const [isPopping, setIsPopping] = useState(false);

  const handleStreakPop = () => {
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300); // Reset after animation completes
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
          particleCount={200} 
          launchSpeed={1}
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
        <div 
          id="streak" 
          style={{
            transform: isPopping ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.2s ease-in-out',
            display: 'inline-block'
          }}
          >
          {streak === 0 
            ? "✨ No streak yet" 
            : `🔥 ${streak} day streak!`
          }
        </div>
      </header>

      <div className="logo-container">
        <Sparkles 
          color="#FFC500" 
          count={5} 
          minSize={20} 
          maxSize={20}
        >
          <h1>Joyfulist</h1>
        </Sparkles>

        <h2>Your daily dose of joy</h2>
      </div>

      <div 
        className="panel" 
        onClick={handlePanelClick}
      >
        {/* Initial state - only shown before tasks are selected */}
        <div 
          className="initialState" 
          style={{
            display: showInitialState ? 'flex' : 'none',
            opacity: showInitialState ? 1 : 0,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" />
          <button>I'm ready for some joy!</button>
          <p className="caption">Your daily joyful tasks are waiting</p>
        </div>

        {/* Header - shown after initialState fades out */}
        <div 
          className="header"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
            visibility: headerVisible || !showInitialState ? 'visible' : 'hidden',
          }}
        >
          <p className="caption">Tick at least one to keep your streak going!</p>
        </div>

        {/* Tasks - shown one by one after header */}
        <div id="tasks">
          {selectedTasks.map((task, index) => (
            <div 
              key={index} 
              className={`${tasksDisabled ? 'disabled' : ''}`}
              style={{
                visibility: !showInitialState ? 'visible' : 'hidden',
                opacity: visibleTasks[index] ? 1 : 0,
                transition: 'opacity 0.3s ease-in',
              }}
            >
              <input 
                type="checkbox" 
                id={`task${index + 1}`}
                checked={checkedState[index]}
                onChange={(e) => {
                  // Prevent click propagation to avoid triggering panel click
                  e.stopPropagation();
                  
                  // Update checked state
                  const newCheckedState = [...checkedState];
                  newCheckedState[index] = !newCheckedState[index];
                  setCheckedState(newCheckedState);
                  
                  // Only process completion if being checked
                  if (!checkedState[index]) {
                    handleTaskCompletion(index);
                  }
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to panel
              />
              <label 
                className={`taskLabel${index + 1}`} 
                htmlFor={`task${index + 1}`}
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to panel
              >
                {task}
              </label>
            </div>
          ))}
        </div>

        {/* CTA section - shown last */}
        <div 
          className="cta"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
            visibility: ctaVisible || !showInitialState ? 'visible' : 'hidden',
          }}
        >
          {showShareButton && (
            <button 
              id="share" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent bubbling to panel
                shareJoy();
              }}
            >
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
                <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" id="hiddenToggle" onClick={toggleDebug} />
                <p>
                  <span>Joyfulist</span> was created by <span>Clare</span> and <a href="https://sandro.design" target="_blank" rel="noreferrer noopener">Sandro</a> in hopes to bring a little more joy into your life.
                </p>

                <p className="caption">All tasks were written by us. Get in touch if you have any you'd like us to add!</p>
              </div>

              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/icon.png`} alt="App icon" />
                <p>Add to your home screen by tapping <span>Share > Add to Home Screen</span> on your phone.</p>
              </div>

              <div className="content credits">
                <p className="caption">This app doesn't track you in any way. Data like your streak count and completed tasks is saved on your device only — it is only accessible by you.</p>

                <p className="caption">Developed using <a target="_blank" rel="noreferrer" href="https://temzasse.github.io/react-modal-sheet/">Modal Sheet</a>, <a target="_blank" rel="noreferrer" href="https://github.com/almond-bongbong/react-confetti-boom">Confetti Boom</a>, and Josh Comeau's <a target="_blank" rel="noreferrer" href="https://www.joshwcomeau.com/react/animated-sparkles-in-react/">Animated Sparkles</a>.
                </p>
              </div>

              <div className="debug">

                <button onClick={() => {
                  resetApp();
                  setOpen(false);
                  }}>
                  Set to initial state
                </button>

                <button onClick={() => {
                  // Reset just the streak
                  setOpen(false);
                  setStreak(0);
                  setLastCompletedDate(null);
                  localStorage.setItem('streakData', JSON.stringify({ streak: 0, lastCompletedDate: null }));
                  }}>
                  Set streak to zero
                </button>

                <button onClick={() => {
                  // Reset daily tasks
                  resetDailyTasks();
                  setOpen(false);
                  }}>
                  Reset today's tasks
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm("Resetting will clear your streak and completed tasks. Are you sure?")) {
                      localStorage.clear();
                      setTimeout(() => window.location.reload(), 100); // Small delay for smoother UX
                    }
                  }}>
                  Clear all cache
                </button>
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