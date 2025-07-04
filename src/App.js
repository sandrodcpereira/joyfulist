import React, { useEffect, useState, useCallback } from 'react';
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
  const [showShareButton, setShowShareButton] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const [tasksSelectedToday, setTasksSelectedToday] = useState(false);
  const [hasIncreasedStreakToday, setHasIncreasedStreakToday] = useState(false);

  const soundTask = new Audio(`${process.env.PUBLIC_URL}/assets/sounds/do.mp3`);
  const soundTaskUndo = new Audio(`${process.env.PUBLIC_URL}/assets/sounds/undo.mp3`);
  const soundStreak = new Audio(`${process.env.PUBLIC_URL}/assets/sounds/pop.mp3`);
  
  // Welcome sheet state
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showWelcomeSheet, setShowWelcomeSheet] = useState(false);
  
  // State for animation control
  const [visibleTasks, setVisibleTasks] = useState([false, false, false]);
  const [showInitialState, setShowInitialState] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  
  // State for tracking checkbox states
  const [checkedState, setCheckedState] = useState([false, false, false]);

  // Function to update streak
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-05-02"
    
    if (lastCompletedDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastCompletedDate(today);
      setHasIncreasedStreakToday(true);
      
      // Store streak data
      const streakData = { streak: newStreak, lastCompletedDate: today };
      localStorage.setItem('streakData', JSON.stringify(streakData));
      
      // Trigger confetti when streak is updated
      handleStreakPop();
      setShowConfetti(true);
      // soundStreak.play();
      
      // Reset confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    }
  }, [lastCompletedDate, streak]);

  // Function to revert streak if all tasks are unchecked
  const revertStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Only revert if streak was increased today
    if (lastCompletedDate === today && hasIncreasedStreakToday) {
      const newStreak = Math.max(0, streak - 1); // Ensure streak doesn't go below 0
      setStreak(newStreak);
      
      // To determine the previous date, we need to know what the date was before today.
      // This is complex to get from just today's date, so we'll set it to yesterday.
      // A more robust solution might store a history, but for this app, yesterday is fine.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const previousDate = newStreak > 0 ? yesterday.toISOString().split('T')[0] : null;

      setLastCompletedDate(previousDate);
      setHasIncreasedStreakToday(false);
      
      // Store updated streak data
      const streakData = { streak: newStreak, lastCompletedDate: previousDate };
      localStorage.setItem('streakData', JSON.stringify(streakData));
    }
  }, [lastCompletedDate, hasIncreasedStreakToday, streak]);

  // FIXED: Rewritten resetApp function to handle manual cycle advancement properly
  const resetApp = () => {
    console.log("Running daily reset...");

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get data from localStorage to make decisions.
    const dailyData = JSON.parse(localStorage.getItem('dailyTasksData') || '{}');
    const streakData = JSON.parse(localStorage.getItem('streakData') || '{}');
    const currentStreak = parseInt(streakData.streak || '0', 10);
    
    // FIXED: Check if tasks were completed either yesterday OR today (for manual advancement)
    const hadCompletionsYesterday = dailyData.date === yesterdayStr && dailyData.hasCompletions;
    const hadCompletionsToday = dailyData.date === today && dailyData.hasCompletions;
    const hadCompletions = hadCompletionsYesterday || hadCompletionsToday;

    // If there is a streak but no tasks were completed, reset the streak.
    if (currentStreak > 0 && !hadCompletions) {
        console.log('Resetting streak: no tasks completed.');
        setStreak(0);
        setLastCompletedDate(null);
        localStorage.setItem('streakData', JSON.stringify({ streak: 0, lastCompletedDate: null }));
    } else if (hadCompletionsToday && dailyData.date === today) {
        // FIXED: If advancing manually and tasks were completed today, 
        // update the lastCompletedDate to today to maintain the streak
        console.log('Maintaining streak: tasks were completed today.');
        localStorage.setItem('streakData', JSON.stringify({ 
          streak: currentStreak, 
          lastCompletedDate: today 
        }));
    }

    // Reset all daily states and UI for the new day
    setTodayDate(new Date().toISOString().split('T')[0]);
    setTasksSelectedToday(false);
    setHasIncreasedStreakToday(false);
    setSelectedTasks(['Tap', 'To', 'Show']);
    setTasksDisabled(true);
    setShowShareButton(false);
    setCheckedState([false, false, false]);
    setShowInitialState(true);
    setHeaderVisible(false);
    setCtaVisible(false);
    setVisibleTasks([false, false, false]);
    
    // Clear the current day's task data
    localStorage.removeItem('dailyTasksData');
  };

  // Load initial data from localStorage
  useEffect(() => {
    // Set up the midnight reset timer. This should only run once.
    const setupMidnightReset = () => {
        const now = new Date();
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0);
        const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
        
        const timeoutId = setTimeout(() => {
            // Run the reset logic for the new day
            resetApp();
            // Schedule the next reset
            setupMidnightReset();
        }, timeUntilMidnight);

        return () => clearTimeout(timeoutId);
    };
    
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
    setHasIncreasedStreakToday(streakData.lastCompletedDate === today);

    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      // Set the welcome sheet to show after a slight delay
      setTimeout(() => {
        setShowWelcomeSheet(true);
      }, 1000);
    }

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
    } else if (dailyTasksData.date && dailyTasksData.date !== today) {
        // Data is from a previous day and should have been reset at midnight.
        // We run resetApp here as a fallback in case the user opens the app
        // after midnight but before the timer has fired (e.g., computer was asleep).
        resetApp();
    }

    // Set up midnight reset and store cleanup function
    const cleanup = setupMidnightReset();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct as resetApp is defined outside and a fallback is in place.

  // Enhanced localStorage saving - save checkbox states more reliably
  useEffect(() => {
    if (!tasksDisabled && tasksSelectedToday) {
      const today = new Date().toISOString().split('T')[0];
      const dailyTasksData = {
        date: today,
        tasks: selectedTasks,
        checkedState: checkedState,
        hasCompletions: checkedState.some(checked => checked === true)
      };
      localStorage.setItem('dailyTasksData', JSON.stringify(dailyTasksData));
    }
  }, [checkedState, tasksDisabled, tasksSelectedToday, selectedTasks]);

  // Update streak based on checked states
  useEffect(() => {
    // Check if any task is checked
    const anyTaskChecked = checkedState.some(checked => checked === true);
    
    // Only update streak if there's at least one task checked and streak hasn't been increased today
    if (anyTaskChecked && !hasIncreasedStreakToday && !tasksDisabled) {
      updateStreak();
    } else if (!anyTaskChecked && hasIncreasedStreakToday && !tasksDisabled) {
      // If all tasks are unchecked and streak was already increased today, revert the streak
      revertStreak();
    }
  }, [checkedState, hasIncreasedStreakToday, tasksDisabled, updateStreak, revertStreak]);

  // Select random tasks function
  const selectRandomTasks = () => {
    // Only proceed if tasks are currently disabled (no tasks have been selected yet)
    if (!tasksDisabled) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Generate new tasks for today
    // Filter out tasks that have been completed
    const availableTasks = tasks.filter(task => !completedTasks.includes(task));
    
    // Select 3 random tasks
    let tasksList = [];
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
      checkedState: [false, false, false],
      hasCompletions: false
    }));

    // Update state
    setSelectedTasks(tasksList);
    setTasksDisabled(false);
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
    
    // Note: The streak updating is now handled in the useEffect hook that watches checkedState
  };

  // Share functionality
  const shareJoy = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Whoopla',
        text: `I'm on a ${streak}-day joy streak with Whoopla! My suggestions for today are: ${selectedTasks.join(' ')} What are yours?`,
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

  // Close welcome sheet and mark as visited
  const closeWelcomeSheet = () => {
    setShowWelcomeSheet(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  // Add a debug function to reset daily tasks
  const resetDailyTasks = () => {
    localStorage.removeItem('dailyTasksData');
    setTasksSelectedToday(false);
    setHasIncreasedStreakToday(false);
    setSelectedTasks(['Tap', 'To', 'Show']);
    setTasksDisabled(true);
    setShowShareButton(false);
    setCheckedState([false, false, false]);
    
    // Reset visibility states
    setShowInitialState(true);
    setHeaderVisible(false);
    setCtaVisible(false);
    setVisibleTasks([false, false, false]);
  };

  // Add a debug function to reset first visit flag
  const resetFirstVisit = () => {
    localStorage.removeItem('hasVisitedBefore');
    setIsFirstVisit(true);
    setShowWelcomeSheet(true);
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

  // Function to determine the header message based on streak and task completion
  const getHeaderMessage = () => {
    // Check if any task is marked as completed
    const hasCompletedTask = checkedState.some(checked => checked === true);
    
    if (hasCompletedTask) {
      return "Neat! Come back tomorrow for new suggestions!";
    } else if (streak === 0) {
      return "Tick at least one to get a streak going!";
    } else {
      return "Tick at least one to keep your streak going!";
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

      <div className="desktop-banner">
        <p>Whoopla is optimised for smaller screens, but still functional on larger displays!</p>
      </div>

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
        <div class="accent-container">
          <div class="accent"></div>
        </div>
        <Sparkles  
          color="#FFC500"  
          count={5}  
          minSize={20}  
          maxSize={20}
        >
          <h1>Whoopla!</h1>
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
          <button className="primary cta">I'm ready for some joy!</button>
          <p className="caption">Your daily suggestions are waiting</p>
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
          <p className="caption">{getHeaderMessage()}</p>
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
                  const wasChecked = newCheckedState[index];
                  newCheckedState[index] = !newCheckedState[index];
                  setCheckedState(newCheckedState);
                  
                  // Play appropriate sound effect
                  if (!wasChecked) {
                    // Task is being checked (ticked)
                    //soundTask.currentTime = 0; // Reset to start in case it's already playing
                    //soundTask.play().catch(error => console.log('Sound play failed:', error));
                    handleTaskCompletion(index);
                  } else {
                    // Task is being unchecked (unticked)
                    //soundTaskUndo.currentTime = 0; // Reset to start in case it's already playing
                    //soundTaskUndo.play().catch(error => console.log('Sound play failed:', error));
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
          style={{
            opacity: ctaVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in',
            visibility: ctaVisible || !showInitialState ? 'visible' : 'hidden',
          }}
        >
          {showShareButton && (
            <button  
              id="share"  
              className="cta"
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

      {/* About Sheet */}
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
                <p className="caption">About Whoopla</p>
                <div><button id="close-btn" onClick={() => setOpen(false)}>Close</button></div>
              </div>

              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" id="hiddenToggle" onClick={toggleDebug} />
                <p>
                  <span>Whoopla</span> was created by <span>Clare</span> and <span><a href="https://sandro.design" target="_blank" rel="noreferrer noopener">Sandro</a></span> in hopes to bring a little more joy into your life.
                </p>

                <p className="caption">All suggestions were written by us. Get in touch if you have any you'd like us to add!</p>
              </div>

              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/icon.png`} alt="App icon" />
                <p>Add to your home screen by tapping <span className="no-wrap"><img src={`${process.env.PUBLIC_URL}/assets/icon-share.png`} className="share-icon apple" alt="Share icon" />  > Add to Home Screen</span> on your phone.</p>
              </div>

              <div className="content credits">
                <p className="caption">This app doesn't track you in any way. Data like your completed suggestions and streak count is saved on your device only.</p>

                <p className="caption">Developed using <a target="_blank" rel="noreferrer" href="https://temzasse.github.io/react-modal-sheet/">Modal Sheet</a>, <a target="_blank" rel="noreferrer" href="https://github.com/almond-bongbong/react-confetti-boom">Confetti Boom</a>, and Josh Comeau's <a target="_blank" rel="noreferrer" href="https://www.joshwcomeau.com/react/animated-sparkles-in-react/">Animated Sparkles</a>.
                </p>
              </div>

              <div className="debug">
                {/* FIXED: Button to advance to the next cycle */}
                <button onClick={() => {
                    if (window.confirm("This will advance the app to a new cycle, resetting today's tasks and updating the streak based on yesterday's completions. Proceed?")) {
                        resetApp();
                        setOpen(false);
                    }
                    }}>
                    Advance to Next Cycle
                </button>

                <button onClick={() => {
                  resetDailyTasks(); // This function already resets the daily state
                  setOpen(false);
                  }}>
                  Set to initial state
                </button>

                <button onClick={() => {
                  // Reset just the streak
                  setOpen(false);
                  setStreak(0);
                  setLastCompletedDate(null);
                  setHasIncreasedStreakToday(false);
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

                <button onClick={() => {
                  // Reset first visit flag
                  resetFirstVisit();
                  setOpen(false);
                  }}>
                  Show welcome again
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
        <Sheet.Backdrop onTap={() => setOpen(false)} />
      </Sheet>

      <Sheet  
        isOpen={showWelcomeSheet}  
        className="welcomeSheet"
        detent="content-height"
        disableDrag={true}
        tweenConfig={{ ease: 'easeOut', duration: 0.4 }}
        // onClose prop was incorrect, it can only accept one function. The button handles the logic now.
        onClose={closeWelcomeSheet}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div>
              <div className="content">
                <img src={`${process.env.PUBLIC_URL}/assets/sparkle.png`} alt="Sparkle" />
                <p>
                  Welcome to <span>Whoopla</span>!
                </p>
                <p>Open the app every morning to get three suggestions for little things you can do to bring a bit of <span>joy</span> into your life.</p>
              </div>
              <div className="content horizontal">
                <div>
                  <img src={`${process.env.PUBLIC_URL}/assets/streak.png`} alt="Sparkle" />
                  <p className="caption">Tick things off as you do them to get a joyful streak going!</p>
                </div>
                <div>
                  <img src={`${process.env.PUBLIC_URL}/assets/icon-sm.png`} alt="Sparkle" />
                  <p className="caption">Add to your home screen by tapping <span className="no-wrap"><img src={`${process.env.PUBLIC_URL}/assets/icon-share.png`} className="share-icon apple" alt="Share icon" />  > Add to Home Screen</span>.</p>
                </div>
              </div>
              <div className="content">
                <button onClick={() => {
                  closeWelcomeSheet();
                  selectRandomTasks();
                  }}  
                  className="welcome-button cta primary">
                    I'm ready for some joy!
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